import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/auth.service';
import { validatePassword } from '@/lib/auth/password';
import { logAccess } from '@/lib/services/log.service';

/**
 * POST /api/auth/register
 * 用户注册
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    // 基本验证
    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: '邮箱、密码和姓名都是必填项' },
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

    // 密码强度验证
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { success: false, error: passwordValidation.errors[0] },
        { status: 400 }
      );
    }

    // 姓名长度验证
    if (name.length < 2 || name.length > 50) {
      return NextResponse.json(
        { success: false, error: '姓名长度必须在2-50个字符之间' },
        { status: 400 }
      );
    }

    // 注册用户
    const { user, session } = await AuthService.register({
      email,
      password,
      name,
    });

    // 返回成功响应（不包含敏感信息）
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
      message: '注册成功',
    });
  } catch (error) {
    console.error('注册失败:', error);

    const errorMessage = error instanceof Error ? error.message : '注册失败';

    // 记录失败的注册
    try {
      await logAccess({
        userId: undefined,
        action: 'REGISTER',
        resource: 'user',
        resourceId: 'unknown',
        success: false,
        ipAddress: request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      });
    } catch (logError) {
      console.warn('记录注册日志失败:', logError);
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 400 }
    );
  }
}
