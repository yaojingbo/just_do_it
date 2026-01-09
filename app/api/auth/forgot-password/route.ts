import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/auth.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error: '请输入邮箱地址',
        },
        { status: 400 }
      );
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: '邮箱格式不正确',
        },
        { status: 400 }
      );
    }

    // 调用AuthService处理密码重置请求
    await AuthService.requestPasswordReset(email);

    // 返回成功响应（不透露用户是否存在的具体信息）
    return NextResponse.json({
      success: true,
      message: '如果该邮箱已注册，您将收到密码重置邮件',
    });
  } catch (error) {
    console.error('密码重置请求失败:', error);

    // 对于安全考虑，即使出错也返回成功消息
    return NextResponse.json({
      success: true,
      message: '如果该邮箱已注册，您将收到密码重置邮件',
    });
  }
}
