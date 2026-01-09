import { NextRequest, NextResponse } from 'next/server';
import { ExpenseDAO } from '@/lib/db/expense-dao';
import { CategoryDAO } from '@/lib/db/category-dao';
import { CreateExpenseInput, ExpenseListQuery } from '@/lib/db/types';
import { createExpenseSchema } from '@/lib/validations/expense';
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

// 模拟数据（当数据库不可用时）
const MOCK_EXPENSES = [
  {
    id: '1',
    amount: 150.00,
    categoryId: 'food-1',
    description: '超市购物 - 蔬菜水果',
    date: new Date('2026-01-07'),
    createdAt: new Date('2026-01-07'),
    updatedAt: new Date('2026-01-07'),
  },
  {
    id: '2',
    amount: 50.00,
    categoryId: 'transport-1',
    description: '地铁交通卡充值',
    date: new Date('2026-01-06'),
    createdAt: new Date('2026-01-06'),
    updatedAt: new Date('2026-01-06'),
  },
];

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000000';

// GET /api/expenses - 获取开支列表
export async function GET(request: NextRequest) {
  try {
    // 获取当前用户会话
    const session = await requireAuth();
    const userId = session.userId;

    const { searchParams } = new URL(request.url);
    const query: ExpenseListQuery = {
      page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 20,
      sortBy: (searchParams.get('sortBy') as any) || 'date',
      sortOrder: (searchParams.get('sortOrder') as any) || 'desc',
      categoryId: searchParams.get('categoryId') || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      search: searchParams.get('search') || undefined,
    };

    // 检查数据库连接
    const dbConnected = await checkDatabaseConnection();

    if (!dbConnected) {
      // 返回模拟数据
      console.warn('Database not connected, using mock data');

      // 记录访问日志
      try {
        await logAccess({
          userId,
          action: 'READ',
          resource: 'expenses',
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
        data: MOCK_EXPENSES,
        pagination: {
          page: 1,
          limit: 20,
          total: MOCK_EXPENSES.length,
          hasNext: false,
          hasPrev: false,
        },
        isMockData: true,
        message: '使用模拟数据（数据库未连接）',
      });
    }

    // 使用数据库（使用真实用户ID）
    const expenses = await ExpenseDAO.findByUserId(userId, query);

    // 记录访问日志
    await logAccess({
      userId,
      action: 'READ',
      resource: 'expenses',
      resourceId: 'list',
      success: true,
      ipAddress: request.ip || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    return NextResponse.json({
      success: true,
      data: expenses,
      pagination: {
        page: query.page || 1,
        limit: query.limit || 20,
        total: expenses.length,
        hasNext: expenses.length === (query.limit || 20),
        hasPrev: (query.page || 1) > 1,
      },
    });
  } catch (error) {
    console.error('获取开支列表失败:', error);

    // 记录失败日志
    try {
      await logAccess({
        userId: DEMO_USER_ID,
        action: 'READ',
        resource: 'expenses',
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
        error: '获取开支列表失败',
        details: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}

// POST /api/expenses - 创建新开支
export async function POST(request: NextRequest) {
  try {
    // 获取当前用户会话
    const session = await requireAuth();
    const userId = session.userId;

    const body = await request.json();

    // 检查数据库连接
    const dbConnected = await checkDatabaseConnection();

    // 如果数据库未连接，使用宽松验证
    let validatedData;
    if (!dbConnected) {
      // 宽松验证（仅检查必要字段）
      if (!body.amount || !body.description || !body.categoryId || !body.date) {
        return NextResponse.json(
          {
            success: false,
            error: '缺少必要字段',
          },
          { status: 400 }
        );
      }
      validatedData = {
        amount: Number(body.amount),
        categoryId: body.categoryId,
        description: String(body.description),
        date: new Date(body.date),
      };
    } else {
      // 严格验证（使用 Zod schema）
      validatedData = createExpenseSchema.parse(body);
    }

    if (!dbConnected) {
      // 返回模拟成功响应
      console.warn('Database not connected, simulating expense creation');

      const mockExpense = {
        id: Math.random().toString(36).substr(2, 9),
        amount: validatedData.amount,
        categoryId: validatedData.categoryId,
        description: validatedData.description,
        date: validatedData.date,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return NextResponse.json({
        success: true,
        data: mockExpense,
        message: '开支创建成功（模拟数据）',
        isMockData: true,
      });
    }

    // 验证分类是否存在且属于用户
    const category = await CategoryDAO.findByIdForUser(
      validatedData.categoryId,
      userId
    );

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          error: '分类不存在或无权限访问',
        },
        { status: 400 }
      );
    }

    // 创建开支（使用真实用户ID）
    const expense = await ExpenseDAO.create(userId, {
      amount: validatedData.amount,
      categoryId: validatedData.categoryId,
      description: validatedData.description,
      date: new Date(validatedData.date),
    });

    // 记录访问日志
    await logAccess({
      userId,
      action: 'CREATE',
      resource: 'expenses',
      resourceId: expense.id,
      success: true,
      ipAddress: request.ip || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    return NextResponse.json({
      success: true,
      data: expense,
      message: '开支创建成功',
    });
  } catch (error) {
    console.error('创建开支失败:', error instanceof Error ? error.message : error);

    // 记录失败日志
    try {
      await logAccess({
        userId: DEMO_USER_ID,
        action: 'CREATE',
        resource: 'expenses',
        resourceId: 'unknown',
        success: false,
        ipAddress: request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      });
    } catch (logError) {
      console.warn('Log access failed:', logError);
    }

    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          error: '创建开支失败',
          details: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: '创建开支失败',
      },
      { status: 500 }
    );
  }
}
