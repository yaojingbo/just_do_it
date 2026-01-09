import { getSession } from '@/lib/auth/session';

/**
 * 认证中间件 - 验证用户是否已登录
 */
export async function requireAuth(request?: Request) {
  const session = await getSession();

  if (!session) {
    throw new Error('Unauthorized');
  }

  return session;
}

/**
 * 可选认证中间件 - 如果用户已登录则返回会话，否则返回 null
 */
export async function optionalAuth() {
  try {
    const session = await getSession();
    return session;
  } catch (error) {
    return null;
  }
}

/**
 * 检查用户是否有特定角色
 */
export async function requireRole(requiredRole: string) {
  const session = await requireAuth();

  if (session.role !== requiredRole) {
    throw new Error('Forbidden');
  }

  return session;
}

/**
 * 检查用户是否为管理员
 */
export async function requireAdmin() {
  return requireRole('admin');
}
