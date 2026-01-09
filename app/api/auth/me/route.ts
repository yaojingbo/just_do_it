import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { UserDAO } from '@/lib/db/user-dao';

export async function GET(request: NextRequest) {
  try {
    // 获取当前会话
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: '未登录',
        },
        { status: 401 }
      );
    }

    // 获取用户信息
    const user = await UserDAO.findById(session.userId);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: '用户不存在',
        },
        { status: 404 }
      );
    }

    // 返回用户信息（不包含密码）
    return NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
          session,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('获取用户信息错误:', error);

    return NextResponse.json(
      {
        success: false,
        error: '获取用户信息失败',
      },
      { status: 500 }
    );
  }
}
