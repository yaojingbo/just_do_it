import { NextRequest, NextResponse } from 'next/server';
import { CategoryDAO } from '@/lib/db/category-dao';
import { CreateCategoryInput } from '@/lib/db/types';
import { createCategorySchema } from '@/lib/validations/category';
import { logAccess } from '@/lib/services/log.service';
import { requireAuth } from '@/lib/middleware/auth';

// 检查数据库连接状态
let isDatabaseConnected = false;
let isCheckingConnection = false;

async function checkDatabaseConnection() {
  if (isCheckingConnection) return isDatabaseConnected;
  isCheckingConnection = true;

  try {
    const { checkDatabaseConnection } = await import('@/lib/db/connection');
    isDatabaseConnected = await checkDatabaseConnection();
  } catch (error) {
    console.error('Database connection check failed:', error);
    isDatabaseConnected = false;
  } finally {
    isCheckingConnection = false;
  }

  return isDatabaseConnected;
}

// 模拟分类数据（当数据库不可用时）
const MOCK_CATEGORIES = [
  {
    id: 'food-1',
    name: '食物餐饮',
    slug: 'food',
    color: '#ef4444',
    isPredefined: true,
  },
  {
    id: 'transport-1',
    name: '交通出行',
    slug: 'transport',
    color: '#3b82f6',
    isPredefined: true,
  },
  {
    id: 'housing-1',
    name: '住房水电',
    slug: 'housing',
    color: '#10b981',
    isPredefined: true,
  },
  {
    id: 'shopping-1',
    name: '服装购物',
    slug: 'shopping',
    color: '#f59e0b',
    isPredefined: true,
  },
  {
    id: 'entertainment-1',
    name: '娱乐休闲',
    slug: 'entertainment',
    color: '#8b5cf6',
    isPredefined: true,
  },
  {
    id: 'healthcare-1',
    name: '医疗健康',
    slug: 'healthcare',
    color: '#ec4899',
    isPredefined: true,
  },
  {
    id: 'education-1',
    name: '学习教育',
    slug: 'education',
    color: '#06b6d4',
    isPredefined: true,
  },
  {
    id: 'investment-1',
    name: '投资储蓄',
    slug: 'investment',
    color: '#14b8a6',
    isPredefined: true,
  },
  {
    id: 'other-1',
    name: '其他杂项',
    slug: 'other',
    color: '#6b7280',
    isPredefined: true,
  },
];

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000000';

// GET /api/categories - 获取分类列表
export async function GET(request: NextRequest) {
  try {
    // 获取当前用户会话
    const session = await requireAuth();
    const userId = session.userId;

    // 检查数据库连接
    const dbConnected = await checkDatabaseConnection();

    if (!dbConnected) {
      // 返回模拟数据
      console.warn('Database not connected, using mock categories data');

      // 记录访问日志
      try {
        await logAccess({
          userId,
          action: 'READ',
          resource: 'categories',
          resourceId: 'list',
          success: true,
          ipAddress: request.ip || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        });
      } catch (logError) {
        console.warn('Log access failed:', logError);
      }

      return NextResponse.json({
        success: true,
        data: MOCK_CATEGORIES,
        isMockData: true,
        message: '使用模拟数据（数据库未连接）',
      });
    }

    // 使用数据库（使用真实用户ID）
    const categories = await CategoryDAO.findAllForUser(userId);

    await logAccess({
      userId,
      action: 'READ',
      resource: 'categories',
      resourceId: 'list',
      success: true,
      ipAddress: request.ip || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('获取分类列表失败:', error);

    // 记录失败日志
    try {
      await logAccess({
        userId: DEMO_USER_ID,
        action: 'READ',
        resource: 'categories',
        resourceId: 'list',
        success: false,
        ipAddress: request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      });
    } catch (logError) {
      console.warn('Log access failed:', logError);
    }

    return NextResponse.json(
      {
        success: false,
        error: '获取分类列表失败',
        details: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}

// POST /api/categories - 创建新分类
export async function POST(request: NextRequest) {
  try {
    // 获取当前用户会话
    const session = await requireAuth();
    const userId = session.userId;

    const body = await request.json();

    // 验证输入
    const validatedData = createCategorySchema.parse(body);

    // 检查分类名是否已存在
    const nameExists = await CategoryDAO.existsByName(
      validatedData.name,
      userId
    );

    if (nameExists) {
      return NextResponse.json(
        {
          success: false,
          error: '分类名已存在',
        },
        { status: 400 }
      );
    }

    // 检查slug是否已存在
    const slugExists = await CategoryDAO.existsBySlug(
      validatedData.slug,
      userId
    );

    if (slugExists) {
      return NextResponse.json(
        {
          success: false,
          error: '分类别名已存在',
        },
        { status: 400 }
      );
    }

    // 创建分类（使用真实用户ID）
    const category = await CategoryDAO.create(userId, validatedData);

    await logAccess({
      userId: session.userId,
      action: 'CREATE',
      resource: 'categories',
      resourceId: category.id,
      success: true,
      ipAddress: request.ip || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    return NextResponse.json({
      success: true,
      data: category,
      message: '分类创建成功',
    });
  } catch (error) {
    console.error('创建分类失败:', error);

    await logAccess({
      userId: session.userId,
      action: 'CREATE',
      resource: 'categories',
      resourceId: 'new',
      success: false,
      ipAddress: request.ip || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        {
          success: false,
          error: '输入数据验证失败',
          details: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: '创建分类失败',
      },
      { status: 500 }
    );
  }
}
