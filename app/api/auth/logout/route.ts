import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/auth.service';

/**
 * POST /api/auth/logout
 * 用户登出
 */
export async function POST(request: NextRequest) {
  try {
    // 执行登出
    await AuthService.logout();

    return NextResponse.json({
      success: true,
      message: '登出成功',
    });
  } catch (error) {
    console.error('登出失败:', error);

    // 即使登出失败，也返回成功（因为用户想要登出）
    return NextResponse.json({
      success: true,
      message: '登出成功',
    });
  }
}
