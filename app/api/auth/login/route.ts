import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/auth.service';
import { logAccess } from '@/lib/services/log.service';

/**
 * POST /api/auth/login
 * 用户登录
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // 基本验证
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: '邮箱和密码都是必填项' },
        { status: 400 }
      );
    }

    // 邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: '邮箱格式不正确' },
        { status: 400 }
      );
    }

    // 登录用户
    const { user, session } = await AuthService.login({
      email,
      password,
    });

    // 返回成功响应
    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        session,
      },
      message: '登录成功',
    });
  } catch (error) {
    console.error('登录失败:', error);

    const errorMessage = error instanceof Error ? error.message : '登录失败';

    // 记录失败的登录
    try {
      await logAccess({
        userId: undefined,
        action: 'LOGIN',
        resource: 'user',
        resourceId: 'unknown',
        success: false,
        ipAddress: request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      });
    } catch (logError) {
      console.warn('记录登录日志失败:', logError);
    }

    // 区分错误类型
    let statusCode = 400;
    if (errorMessage === '邮箱或密码错误') {
      statusCode = 401;
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: statusCode }
    );
  }
}
