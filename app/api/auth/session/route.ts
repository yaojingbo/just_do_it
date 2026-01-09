import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth/auth.service';

/**
 * GET /api/auth/session
 * 获取当前会话信息
 */
export async function GET(request: NextRequest) {
  try {
    const session = await AuthService.getCurrentUser();

    if (!session) {
      return NextResponse.json(
        { success: false, error: '未登录' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error('获取会话失败:', error);

    return NextResponse.json(
      {
        success: false,
        error: '获取会话失败',
      },
      { status: 500 }
    );
  }
}
