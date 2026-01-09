import { UserDAO } from '@/lib/db/user-dao';
import { hashPassword, verifyPassword } from './password';
import { setSessionCookie, clearSessionCookie, getSession, updateSession, type Session } from './session';
import { logAccess } from '@/lib/services/log.service';

/**
 * 认证服务
 */
export class AuthService {
  /**
   * 用户注册
   */
  static async register(input: {
    email: string;
    password: string;
    name: string;
  }): Promise<{ user: any; session: Session }> {
    // 检查邮箱是否已存在
    const emailExists = await UserDAO.existsByEmail(input.email);
    if (emailExists) {
      throw new Error('邮箱已被注册');
    }

    // 创建用户
    const user = await UserDAO.create({
      email: input.email,
      password: input.password,
      name: input.name,
    });

    // 创建会话
    const session: Session = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: new Date(),
    };

    setSessionCookie(session);

    // 记录访问日志
    try {
      await logAccess({
        userId: user.id,
        action: 'REGISTER',
        resource: 'user',
        resourceId: user.id,
        success: true,
        ipAddress: 'unknown',
        userAgent: 'unknown',
      });
    } catch (logError) {
      console.warn('记录注册日志失败:', logError);
    }

    return { user, session };
  }

  /**
   * 用户登录
   */
  static async login(input: {
    email: string;
    password: string;
  }): Promise<{ user: any; session: Session }> {
    // 验证凭据
    const user = await UserDAO.validateCredentials(input.email, input.password);

    if (!user) {
      // 记录失败的登录尝试
      try {
        await logAccess({
          userId: undefined,
          action: 'LOGIN',
          resource: 'user',
          resourceId: 'unknown',
          success: false,
          ipAddress: 'unknown',
          userAgent: 'unknown',
        });
      } catch (logError) {
        console.warn('记录登录日志失败:', logError);
      }

      throw new Error('邮箱或密码错误');
    }

    // 创建会话
    const session: Session = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: new Date(),
    };

    setSessionCookie(session);

    // 记录成功的登录
    try {
      await logAccess({
        userId: user.id,
        action: 'LOGIN',
        resource: 'user',
        resourceId: user.id,
        success: true,
        ipAddress: 'unknown',
        userAgent: 'unknown',
      });
    } catch (logError) {
      console.warn('记录登录日志失败:', logError);
    }

    return { user, session };
  }

  /**
   * 用户登出
   */
  static async logout(): Promise<void> {
    try {
      const session = await getSession();

      if (session) {
        await logAccess({
          userId: session.userId,
          action: 'LOGOUT',
          resource: 'user',
          resourceId: session.userId,
          success: true,
          ipAddress: 'unknown',
          userAgent: 'unknown',
        });
      }
    } catch (logError) {
      console.warn('记录登出日志失败:', logError);
    }

    clearSessionCookie();
  }

  /**
   * 获取当前用户信息
   */
  static async getCurrentUser(): Promise<any> {
    const session = await getSession();
    return session;
  }

  /**
   * 更新用户信息
   */
  static async updateProfile(input: {
    name?: string;
    email?: string;
    password?: string;
  }): Promise<any> {
    const session = await getSession();

    if (!session) {
      throw new Error('未登录');
    }

    // 更新用户信息
    const updatedUser = await UserDAO.update(session.userId, input);

    // 更新会话信息
    const newSession: Session = {
      userId: session.userId,
      email: updatedUser?.email || session.email,
      name: updatedUser?.name || session.name,
      role: updatedUser?.role || session.role,
      createdAt: session.createdAt,
    };

    await updateSession(newSession);

    return updatedUser;
  }

  /**
   * 检查用户是否已登录
   */
  static async isAuthenticated(): Promise<boolean> {
    const session = await getSession();
    return !!session;
  }

  /**
   * 请求密码重置
   */
  static async requestPasswordReset(email: string): Promise<void> {
    // 查找用户
    const user = await UserDAO.findByEmailWithPassword(email);

    // 如果用户存在，记录密码重置请求
    if (user) {
      try {
        await logAccess({
          userId: user.id,
          action: 'PASSWORD_RESET_REQUEST',
          resource: 'user',
          resourceId: user.id,
          success: true,
          ipAddress: 'unknown',
          userAgent: 'unknown',
        });
      } catch (logError) {
        console.warn('记录密码重置请求日志失败:', logError);
      }
    }

    // 注意：这里应该发送邮件，但在演示环境中我们只是记录请求
    console.log(`密码重置请求: ${email}`);
  }

  /**
   * 重置密码
   */
  static async resetPassword(email: string, newPassword: string): Promise<void> {
    // 验证新密码
    if (!newPassword || newPassword.length < 6) {
      throw new Error('密码长度至少6位');
    }

    // 查找用户
    const user = await UserDAO.findByEmailWithPassword(email);
    if (!user) {
      throw new Error('用户不存在');
    }

    // 更新密码
    await UserDAO.update(user.id, { password: newPassword });

    // 记录密码重置
    try {
      await logAccess({
        userId: user.id,
        action: 'PASSWORD_RESET',
        resource: 'user',
        resourceId: user.id,
        success: true,
        ipAddress: 'unknown',
        userAgent: 'unknown',
      });
    } catch (logError) {
      console.warn('记录密码重置日志失败:', logError);
    }
  }

  /**
   * 获取演示用户（用于开发/演示）
   */
  static async getDemoUser(): Promise<any> {
    return UserDAO.createDemoUser();
  }
}
