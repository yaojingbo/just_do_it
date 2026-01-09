import { cookies } from 'next/headers';
import { UserDAO } from '@/lib/db/user-dao';

export interface Session {
  userId: string;
  email: string;
  name: string;
  role: string;
  createdAt: Date;
}

const SESSION_COOKIE_NAME = 'session_token';
const SESSION_EXPIRY_DAYS = 30;

/**
 * 生成随机令牌
 */
function generateSessionToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * 设置会话Cookie
 */
export function setSessionCookie(session: Session): void {
  const token = generateSessionToken();
  const sessionData = JSON.stringify(session);

  cookies().set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_EXPIRY_DAYS * 24 * 60 * 60,
    path: '/',
  });

  // 在实际应用中，这里应该将token和session的映射存储到数据库或缓存中
  // 暂时使用内存存储（生产环境中需要使用Redis等）
  (globalThis as any).sessionStore = (globalThis as any).sessionStore || new Map();
  (globalThis as any).sessionStore.set(token, sessionData);
}

/**
 * 清除会话Cookie
 */
export function clearSessionCookie(): void {
  const cookieStore = cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);

  // 清除内存中的会话数据
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (token && (globalThis as any).sessionStore) {
    (globalThis as any).sessionStore.delete(token);
  }
}

/**
 * 获取当前会话
 */
export async function getSession(): Promise<Session | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) {
      return null;
    }

    // 从内存中获取会话数据
    const sessionData = (globalThis as any).sessionStore?.get(token);

    if (!sessionData) {
      return null;
    }

    const session: Session = JSON.parse(sessionData);

    // 验证用户是否仍然存在
    const user = await UserDAO.findById(session.userId);
    if (!user) {
      return null;
    }

    return session;
  } catch (error) {
    console.error('获取会话失败:', error);
    return null;
  }
}

/**
 * 更新会话信息
 */
export async function updateSession(session: Session): Promise<void> {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;

  if (!token || !(globalThis as any).sessionStore) {
    return;
  }

  (globalThis as any).sessionStore.set(token, JSON.stringify(session));
}

/**
 * 创建会话
 */
export async function createSession(user: any): Promise<Session> {
  const session: Session = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: new Date(),
  };

  setSessionCookie(session);

  return session;
}

/**
 * 清除会话
 */
export async function clearSession(): Promise<void> {
  clearSessionCookie();
}

/**
 * 要求认证
 */
export async function requireAuth(): Promise<Session> {
  const session = await getSession();

  if (!session) {
    throw new Error('Unauthorized');
  }

  return session;
}
