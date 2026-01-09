import { NextRequest, NextResponse } from 'next/server';
import { CategoryDAO } from '@/lib/db/category-dao';
import { UpdateCategoryInput } from '@/lib/db/types';
import { updateCategorySchema } from '@/lib/validations/category';
import { logAccess } from '@/lib/services/log.service';

// 模拟用户ID（实际应用中应从认证中获取）
const DEMO_USER_ID = 'demo-user-id';

// GET /api/categories/[id] - 获取单个分类
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const category = await CategoryDAO.findByIdForUser(params.id, DEMO_USER_ID);

    if (!category) {
      await logAccess({
        userId: DEMO_USER_ID,
        action: 'READ',
        resource: 'categories',
        resourceId: params.id,
        success: false,
        ipAddress: request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      });

      return NextResponse.json(
        {
          success: false,
          error: '分类不存在',
        },
        { status: 404 }
      );
    }

    await logAccess({
      userId: DEMO_USER_ID,
      action: 'READ',
      resource: 'categories',
      resourceId: params.id,
      success: true,
      ipAddress: request.ip || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    return NextResponse.json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error('获取分类详情失败:', error);

    await logAccess({
      userId: DEMO_USER_ID,
      action: 'READ',
      resource: 'categories',
      resourceId: params.id,
      success: false,
      ipAddress: request.ip || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    return NextResponse.json(
      {
        success: false,
        error: '获取分类详情失败',
      },
      { status: 500 }
    );
  }
}

// PUT /api/categories/[id] - 更新分类
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // 验证输入
    const validatedData = updateCategorySchema.parse(body);

    // 如果更新了名称，检查是否已存在
    if (validatedData.name) {
      const nameExists = await CategoryDAO.existsByName(
        validatedData.name,
        DEMO_USER_ID
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
    }

    // 如果更新了slug，检查是否已存在
    if (validatedData.slug) {
      const slugExists = await CategoryDAO.existsBySlug(
        validatedData.slug,
        DEMO_USER_ID
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
    }

    // 更新分类
    const category = await CategoryDAO.update(
      params.id,
      DEMO_USER_ID,
      validatedData
    );

    if (!category) {
      await logAccess({
        userId: DEMO_USER_ID,
        action: 'UPDATE',
        resource: 'categories',
        resourceId: params.id,
        success: false,
        ipAddress: request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      });

      return NextResponse.json(
        {
          success: false,
          error: '分类不存在或无权限修改',
        },
        { status: 404 }
      );
    }

    await logAccess({
      userId: DEMO_USER_ID,
      action: 'UPDATE',
      resource: 'categories',
      resourceId: params.id,
      success: true,
      ipAddress: request.ip || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    return NextResponse.json({
      success: true,
      data: category,
      message: '分类更新成功',
    });
  } catch (error) {
    console.error('更新分类失败:', error);

    await logAccess({
      userId: DEMO_USER_ID,
      action: 'UPDATE',
      resource: 'categories',
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
        error: '更新分类失败',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/[id] - 删除分类
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deleted = await CategoryDAO.delete(params.id, DEMO_USER_ID);

    if (!deleted) {
      await logAccess({
        userId: DEMO_USER_ID,
        action: 'DELETE',
        resource: 'categories',
        resourceId: params.id,
        success: false,
        ipAddress: request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      });

      return NextResponse.json(
        {
          success: false,
          error: '分类不存在或无权限删除',
        },
        { status: 404 }
      );
    }

    await logAccess({
      userId: DEMO_USER_ID,
      action: 'DELETE',
      resource: 'categories',
      resourceId: params.id,
      success: true,
      ipAddress: request.ip || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    return NextResponse.json({
      success: true,
      message: '分类删除成功',
    });
  } catch (error) {
    console.error('删除分类失败:', error);

    await logAccess({
      userId: DEMO_USER_ID,
      action: 'DELETE',
      resource: 'categories',
      resourceId: params.id,
      success: false,
      ipAddress: request.ip || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    return NextResponse.json(
      {
        success: false,
        error: '删除分类失败',
      },
      { status: 500 }
    );
  }
}
