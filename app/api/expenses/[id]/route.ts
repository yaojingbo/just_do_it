import { NextRequest, NextResponse } from 'next/server';
import { ExpenseDAO } from '@/lib/db/expense-dao';
import { CategoryDAO } from '@/lib/db/category-dao';
import { UpdateExpenseInput } from '@/lib/db/types';
import { updateExpenseSchema } from '@/lib/validations/expense';
import { logAccess } from '@/lib/services/log.service';
import { requireAuth } from '@/lib/middleware/auth';

// 模拟用户ID（实际应用中应从认证中获取）
const DEMO_USER_ID = 'demo-user-id';

// GET /api/expenses/[id] - 获取单个开支
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 获取当前用户会话
    const session = await requireAuth();
    const userId = session.userId;

    const expense = await ExpenseDAO.findById(params.id, userId);

    if (!expense) {
      await logAccess({
        userId,
        action: 'READ',
        resource: 'expenses',
        resourceId: params.id,
        success: false,
        ipAddress: request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      });

      return NextResponse.json(
        {
          success: false,
          error: '开支不存在',
        },
        { status: 404 }
      );
    }

    await logAccess({
      userId,
      action: 'READ',
      resource: 'expenses',
      resourceId: params.id,
      success: true,
      ipAddress: request.ip || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    return NextResponse.json({
      success: true,
      data: expense,
    });
  } catch (error) {
    console.error('获取开支详情失败:', error);

    await logAccess({
      userId: DEMO_USER_ID,
      action: 'READ',
      resource: 'expenses',
      resourceId: params.id,
      success: false,
      ipAddress: request.ip || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    return NextResponse.json(
      {
        success: false,
        error: '获取开支详情失败',
      },
      { status: 500 }
    );
  }
}

// PUT /api/expenses/[id] - 更新开支
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 获取当前用户会话
    const session = await requireAuth();
    const userId = session.userId;

    const body = await request.json();

    // 验证输入
    const validatedData = updateExpenseSchema.parse(body);

    // 验证分类是否存在且属于用户
    if (validatedData.categoryId) {
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
    }

    // 更新开支
    const expense = await ExpenseDAO.update(params.id, userId, {
      ...validatedData,
      date: validatedData.date ? new Date(validatedData.date) : undefined,
    });

    if (!expense) {
      await logAccess({
        userId,
        action: 'UPDATE',
        resource: 'expenses',
        resourceId: params.id,
        success: false,
        ipAddress: request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      });

      return NextResponse.json(
        {
          success: false,
          error: '开支不存在或无权限修改',
        },
        { status: 404 }
      );
    }

    await logAccess({
      userId,
      action: 'UPDATE',
      resource: 'expenses',
      resourceId: params.id,
      success: true,
      ipAddress: request.ip || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    return NextResponse.json({
      success: true,
      data: expense,
      message: '开支更新成功',
    });
  } catch (error) {
    console.error('更新开支失败:', error);

    await logAccess({
      userId: DEMO_USER_ID,
      action: 'UPDATE',
      resource: 'expenses',
      resourceId: params.id,
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
        error: '更新开支失败',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/expenses/[id] - 删除开支
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 获取当前用户会话
    const session = await requireAuth();
    const userId = session.userId;

    const deleted = await ExpenseDAO.delete(params.id, userId);

    if (!deleted) {
      await logAccess({
        userId,
        action: 'DELETE',
        resource: 'expenses',
        resourceId: params.id,
        success: false,
        ipAddress: request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      });

      return NextResponse.json(
        {
          success: false,
          error: '开支不存在或无权限删除',
        },
        { status: 404 }
      );
    }

    await logAccess({
      userId,
      action: 'DELETE',
      resource: 'expenses',
      resourceId: params.id,
      success: true,
      ipAddress: request.ip || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    return NextResponse.json({
      success: true,
      message: '开支删除成功',
    });
  } catch (error) {
    console.error('删除开支失败:', error);

    await logAccess({
      userId: DEMO_USER_ID,
      action: 'DELETE',
      resource: 'expenses',
      resourceId: params.id,
      success: false,
      ipAddress: request.ip || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    return NextResponse.json(
      {
        success: false,
        error: '删除开支失败',
      },
      { status: 500 }
    );
  }
}
