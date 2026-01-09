import { db } from './connection';
import { users } from './schema';
import { eq, ilike } from 'drizzle-orm';
import type { User, NewUser, CreateUserInput, UpdateUserInput } from './types';
import { hashPassword, verifyPassword } from '@/lib/auth/password';

/**
 * 用户数据访问对象
 */
export class UserDAO {
  /**
   * 创建新用户
   */
  static async create(input: CreateUserInput): Promise<User> {
    const hashedPassword = await hashPassword(input.password);

    const [user] = await db
      .insert(users)
      .values({
        email: input.email.toLowerCase(),
        name: input.name,
        password: hashedPassword,
        role: 'user',
      })
      .returning();

    return user;
  }

  /**
   * 根据邮箱查找用户（包含密码，用于登录验证）
   */
  static async findByEmailWithPassword(email: string): Promise<(User & { password: string }) | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()));

    if (!user) return null;

    return user as User & { password: string };
  }

  /**
   * 根据ID查找用户
   */
  static async findById(id: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id));

    return user || null;
  }

  /**
   * 验证用户凭据
   */
  static async validateCredentials(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmailWithPassword(email);

    if (!user) return null;

    const isValid = await verifyPassword(password, user.password);

    if (!isValid) return null;

    // 返回不包含密码的用户信息
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  /**
   * 更新用户信息
   */
  static async update(id: string, input: UpdateUserInput): Promise<User | null> {
    const updateData: Partial<NewUser> = {};

    if (input.name !== undefined) {
      updateData.name = input.name;
    }

    if (input.email !== undefined) {
      updateData.email = input.email.toLowerCase();
    }

    if (input.password !== undefined) {
      updateData.password = await hashPassword(input.password);
    }

    const [user] = await db
      .update(users)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    return user || null;
  }

  /**
   * 根据邮箱检查用户是否存在
   */
  static async existsByEmail(email: string): Promise<boolean> {
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    return !!user;
  }

  /**
   * 搜索用户（管理员功能）
   */
  static async search(query: string, limit: number = 20): Promise<User[]> {
    const results = await db
      .select()
      .from(users)
      .where(ilike(users.name, `%${query}%`))
      .limit(limit);

    return results;
  }

  /**
   * 获取用户总数
   */
  static async getCount(): Promise<number> {
    const result = await db
      .select({ count: users.id })
      .from(users);

    return result.length;
  }

  /**
   * 删除用户（管理员功能）
   */
  static async delete(id: string): Promise<boolean> {
    const result = await db
      .delete(users)
      .where(eq(users.id, id));

    return result.rowCount > 0;
  }

  /**
   * 创建演示用户（用于开发/演示）
   */
  static async createDemoUser(): Promise<User> {
    const demoEmail = 'demo@example.com';

    // 检查演示用户是否已存在
    const existingUser = await this.findByEmailWithPassword(demoEmail);

    if (existingUser) {
      const { password: _, ...userWithoutPassword } = existingUser;
      return userWithoutPassword as User;
    }

    // 创建新的演示用户
    return this.create({
      email: demoEmail,
      name: '演示用户',
      password: 'demo123456',
    });
  }
}
