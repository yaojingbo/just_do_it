import { db } from './connection';
import { categories } from './schema';
import { eq, and, inArray, desc, asc } from 'drizzle-orm';
import type { Category, NewCategory, CreateCategoryInput, UpdateCategoryInput } from './types';
import { PREDEFINED_CATEGORIES } from './types';

/**
 * 分类数据访问对象
 */
export class CategoryDAO {
  /**
   * 创建新分类
   */
  static async create(userId: string, input: CreateCategoryInput): Promise<Category> {
    const [category] = await db
      .insert(categories)
      .values({
        userId,
        name: input.name,
        slug: input.slug,
        color: input.color,
        isPredefined: false,
      })
      .returning();

    return category;
  }

  /**
   * 获取用户的所有分类（包含预定义分类）
   */
  static async findByUserId(userId: string): Promise<Category[]> {
    const results = await db
      .select()
      .from(categories)
      .where(eq(categories.userId, userId))
      .orderBy(asc(categories.name));

    return results;
  }

  /**
   * 获取用户的所有分类，包括预定义分类
   */
  static async findAllForUser(userId: string): Promise<Category[]> {
    const results = await db
      .select()
      .from(categories)
      .where(
        and(
          eq(categories.userId, userId),
          eq(categories.isPredefined, false)
        )
      )
      .orderBy(asc(categories.name));

    // 预定义分类（不区分用户）
    const predefinedResults = await db
      .select()
      .from(categories)
      .where(eq(categories.isPredefined, true))
      .orderBy(asc(categories.name));

    return [...predefinedResults, ...results];
  }

  /**
   * 根据ID获取分类
   */
  static async findById(id: string): Promise<Category | null> {
    const [category] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id));

    return category || null;
  }

  /**
   * 根据ID和用户ID获取分类（确保用户只能访问自己的分类或预定义分类）
   */
  static async findByIdForUser(id: string, userId: string): Promise<Category | null> {
    const [category] = await db
      .select()
      .from(categories)
      .where(
        and(
          eq(categories.id, id),
          or(
            eq(categories.userId, userId),
            eq(categories.isPredefined, true)
          )
        )
      );

    return category || null;
  }

  /**
   * 更新分类
   */
  static async update(id: string, userId: string, input: UpdateCategoryInput): Promise<Category | null> {
    // 确保不能修改预定义分类
    const existingCategory = await this.findById(id);
    if (!existingCategory || existingCategory.isPredefined) {
      return null;
    }

    // 确保用户只能修改自己的分类
    if (existingCategory.userId !== userId) {
      return null;
    }

    const updateData: Partial<NewCategory> = {};

    if (input.name !== undefined) {
      updateData.name = input.name;
    }

    if (input.slug !== undefined) {
      updateData.slug = input.slug;
    }

    if (input.color !== undefined) {
      updateData.color = input.color;
    }

    const [category] = await db
      .update(categories)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(categories.id, id),
          eq(categories.userId, userId)
        )
      )
      .returning();

    return category || null;
  }

  /**
   * 删除分类
   */
  static async delete(id: string, userId: string): Promise<boolean> {
    // 确保不能删除预定义分类
    const existingCategory = await this.findById(id);
    if (!existingCategory || existingCategory.isPredefined) {
      return false;
    }

    // 确保用户只能删除自己的分类
    if (existingCategory.userId !== userId) {
      return false;
    }

    const result = await db
      .delete(categories)
      .where(
        and(
          eq(categories.id, id),
          eq(categories.userId, userId)
        )
      );

    return result.rowCount > 0;
  }

  /**
   * 检查分类名是否已存在（对于指定用户）
   */
  static async existsByName(name: string, userId: string): Promise<boolean> {
    const [category] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(
        and(
          eq(categories.name, name),
          eq(categories.userId, userId)
        )
      )
      .limit(1);

    return !!category;
  }

  /**
   * 检查slug是否已存在（对于指定用户）
   */
  static async existsBySlug(slug: string, userId: string): Promise<boolean> {
    const [category] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(
        and(
          eq(categories.slug, slug),
          eq(categories.userId, userId)
        )
      )
      .limit(1);

    return !!category;
  }

  /**
   * 同步预定义分类到数据库
   * 这个方法会检查预定义分类是否已在数据库中存在，如果不存在则创建
   */
  static async syncPredefinedCategories(): Promise<void> {
    // 获取所有现有的预定义分类
    const existingPredefined = await db
      .select()
      .from(categories)
      .where(eq(categories.isPredefined, true));

    // 提取现有的预定义分类slug（用于检查是否存在）
    const existingSlugs = new Set(existingPredefined.map((cat: Category) => cat.slug));

    // 检查每个预定义分类是否已在数据库中
    for (const predefinedCat of PREDEFINED_CATEGORIES) {
      if (!existingSlugs.has(predefinedCat.slug)) {
        // 如果不存在，则创建（使用自动生成的UUID）
        await db
          .insert(categories)
          .values({
            userId: '00000000-0000-0000-0000-000000000000', // 特殊的系统用户ID
            name: predefinedCat.name,
            slug: predefinedCat.slug,
            color: predefinedCat.color,
            isPredefined: true,
          });
      }
    }
  }

  /**
   * 获取预定义分类
   */
  static async findPredefined(): Promise<Category[]> {
    const results = await db
      .select()
      .from(categories)
      .where(eq(categories.isPredefined, true))
      .orderBy(asc(categories.name));

    return results;
  }

  /**
   * 获取用户的自定义分类（非预定义）
   */
  static async findUserCategories(userId: string): Promise<Category[]> {
    const results = await db
      .select()
      .from(categories)
      .where(
        and(
          eq(categories.userId, userId),
          eq(categories.isPredefined, false)
        )
      )
      .orderBy(asc(categories.name));

    return results;
  }

  /**
   * 批量删除用户的自定义分类
   */
  static async deleteByUserId(userId: string): Promise<number> {
    const result = await db
      .delete(categories)
      .where(
        and(
          eq(categories.userId, userId),
          eq(categories.isPredefined, false)
        )
      );

    return result.rowCount;
  }

  /**
   * 检查分类是否属于指定用户
   */
  static async belongsToUser(categoryId: string, userId: string): Promise<boolean> {
    const category = await this.findByIdForUser(categoryId, userId);
    return category !== null && !category.isPredefined;
  }
}

// 导入 or 操作符
import { or } from 'drizzle-orm';
