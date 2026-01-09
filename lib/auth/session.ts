import { cookies } from 'next/headers';
import { UserDAO } from '@/lib/db/user-dao';

export interface Session {
  userId: string;
  email: string;
  name: string;
  role: string;
  createdAt: Date;
}

const SESSION_COOKIE_NAME = 'session_data';
const SESSION_EXPIRY_DAYS = 30;

/**
 * Base64 编码/解码
 */
function base64Encode(str: string): string {
  return Buffer.from(str, 'utf-8').toString('base64');
}

function base64Decode(str: string): string {
  try {
    return Buffer.from(str, 'base64').toString('utf-8');
  } catch {
    return '';
  }
}

/**
 * 设置会话Cookie - 将 session 数据直接存储在 cookie 中
 */
export function setSessionCookie(session: Session): void {
  const sessionData = {
    ...session,
    expiresAt: Date.now() + (SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000),
  };

  // 将 session 数据直接编码到 cookie 中
  const encodedSession = base64Encode(JSON.stringify(sessionData));

  cookies().set(SESSION_COOKIE_NAME, encodedSession, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_EXPIRY_DAYS * 24 * 60 * 60,
    path: '/',
  });
}

/**
 * 清除会话Cookie
 */
export function clearSessionCookie(): void {
  const cookieStore = cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * 获取当前会话 - 从 cookie 中直接读取 session 数据
 */
export async function getSession(): Promise<Session | null> {
  try {
    const cookieStore = cookies();
    const encodedSession = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!encodedSession) {
      return null;
    }

    // 解码 session 数据
    const sessionJson = base64Decode(encodedSession);
    if (!sessionJson) {
      return null;
    }

    const sessionData = JSON.parse(sessionJson);

    // 检查是否过期
    if (sessionData.expiresAt && Date.now() > sessionData.expiresAt) {
      clearSessionCookie();
      return null;
    }

    // 返回会话数据（不包含 expiresAt）
    const session: Session = {
      userId: sessionData.userId,
      email: sessionData.email,
      name: sessionData.name,
      role: sessionData.role,
      createdAt: new Date(sessionData.createdAt),
    };

    // 验证用户是否仍然存在（可选，避免每次都查询数据库）
    try {
      const user = await UserDAO.findById(session.userId);
      if (!user) {
        return null;
      }
    } catch (error) {
      // 如果数据库查询失败，仍然返回会话数据
      console.warn('验证用户存在性失败:', error);
    }

    return session;
  } catch (error) {
    console.error('获取会话失败:', error);
    return null;
  }
}

/**
 * 更新会话信息 - 重新设置 cookie
 */
export async function updateSession(session: Session): Promise<void> {
  setSessionCookie(session);
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
