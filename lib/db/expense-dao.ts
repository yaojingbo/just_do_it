import { db, conditions } from './connection';
import { expenses, categories } from './schema';
import { eq, and, gte, lte, like, ilike, desc, asc, sql } from 'drizzle-orm';
import type {
  Expense,
  NewExpense,
  ExpenseWithCategory,
  CreateExpenseInput,
  UpdateExpenseInput,
  ExpenseListQuery,
  CategoryStatistics,
  MonthlyStatistics,
  DashboardStats
} from './types';

/**
 * 开支数据访问对象
 */
export class ExpenseDAO {
  /**
   * 创建开支记录
   */
  static async create(userId: string, input: CreateExpenseInput): Promise<Expense> {
    const [expense] = await db
      .insert(expenses)
      .values({
        userId,
        amount: input.amount,
        categoryId: input.categoryId,
        description: input.description,
        date: input.date,
      })
      .returning();

    return expense;
  }

  /**
   * 获取用户的开支列表（带分类信息）
   */
  static async findByUserId(
    userId: string,
    query: ExpenseListQuery = {}
  ): Promise<ExpenseWithCategory[]> {
    const {
      page = 1,
      limit = 20,
      sortBy = 'date',
      sortOrder = 'desc',
      categoryId,
      dateFrom,
      dateTo,
      search,
    } = query;

    const offset = (page - 1) * limit;

    // 构建查询条件
    const whereConditions = [eq(expenses.userId, userId)];

    if (categoryId) {
      whereConditions.push(eq(expenses.categoryId, categoryId));
    }

    if (dateFrom) {
      whereConditions.push(gte(expenses.date, new Date(dateFrom)));
    }

    if (dateTo) {
      whereConditions.push(lte(expenses.date, new Date(dateTo)));
    }

    if (search) {
      whereConditions.push(ilike(expenses.description, `%${search}%`));
    }

    // 构建排序条件
    const orderByClause = sortOrder === 'asc'
      ? asc(expenses.date)
      : desc(expenses.date);

    const results = await db
      .select({
        id: expenses.id,
        userId: expenses.userId,
        amount: expenses.amount,
        categoryId: expenses.categoryId,
        description: expenses.description,
        date: expenses.date,
        createdAt: expenses.createdAt,
        updatedAt: expenses.updatedAt,
        category: {
          id: categories.id,
          name: categories.name,
          color: categories.color,
          isPredefined: categories.isPredefined,
        },
      })
      .from(expenses)
      .leftJoin(categories, eq(expenses.categoryId, categories.id))
      .where(and(...whereConditions))
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

    return results as ExpenseWithCategory[];
  }

  /**
   * 根据ID获取开支记录
   */
  static async findById(id: string, userId: string): Promise<Expense | null> {
    const [expense] = await db
      .select()
      .from(expenses)
      .where(and(eq(expenses.id, id), eq(expenses.userId, userId)));

    return expense || null;
  }

  /**
   * 更新开支记录
   */
  static async update(id: string, userId: string, input: UpdateExpenseInput): Promise<Expense | null> {
    const { id: _, ...updateData } = input;

    const [expense] = await db
      .update(expenses)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(and(eq(expenses.id, id), eq(expenses.userId, userId)))
      .returning();

    return expense || null;
  }

  /**
   * 删除开支记录
   */
  static async delete(id: string, userId: string): Promise<boolean> {
    const result = await db
      .delete(expenses)
      .where(and(eq(expenses.id, id), eq(expenses.userId, userId)));

    return result.rowCount > 0;
  }

  /**
   * 获取开支统计数据
   */
  static async getStatistics(userId: string, dateFrom?: Date, dateTo?: Date): Promise<DashboardStats> {
    const whereConditions = [eq(expenses.userId, userId)];

    if (dateFrom) {
      whereConditions.push(gte(expenses.date, dateFrom));
    }

    if (dateTo) {
      whereConditions.push(lte(expenses.date, dateTo));
    }

    // 总开支统计
    const totalStats = await db
      .select({
        totalAmount: sql<number>`SUM(CAST(${expenses.amount} AS DECIMAL))`,
        totalCount: sql<number>`COUNT(*)`,
      })
      .from(expenses)
      .where(and(...whereConditions));

    // 本月开支统计
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const thisMonthStats = await db
      .select({
        totalAmount: sql<number>`SUM(CAST(${expenses.amount} AS DECIMAL))`,
        totalCount: sql<number>`COUNT(*)`,
      })
      .from(expenses)
      .where(and(
        ...whereConditions,
        gte(expenses.date, currentMonth)
      ));

    // 计算平均每天开支
    const totalAmount = Number(totalStats[0]?.totalAmount || 0);
    const thisMonthAmount = Number(thisMonthStats[0]?.totalAmount || 0);
    const daysInMonth = new Date().getDate();
    const averageDaily = thisMonthAmount / daysInMonth;

    return {
      totalExpenses: totalStats[0]?.totalCount || 0,
      totalAmount: totalAmount.toFixed(2),
      thisMonthExpenses: thisMonthStats[0]?.totalCount || 0,
      thisMonthAmount: thisMonthAmount.toFixed(2),
      averageDailyAmount: averageDaily.toFixed(2),
      categoryCount: 0, // 这里可以后续添加分类统计
    };
  }

  /**
   * 按分类获取开支统计
   */
  static async getCategoryStatistics(
    userId: string,
    dateFrom?: Date,
    dateTo?: Date
  ): Promise<CategoryStatistics[]> {
    const whereConditions = [eq(expenses.userId, userId)];

    if (dateFrom) {
      whereConditions.push(gte(expenses.date, dateFrom));
    }

    if (dateTo) {
      whereConditions.push(lte(expenses.date, dateTo));
    }

    const results = await db
      .select({
        categoryId: expenses.categoryId,
        categoryName: categories.name,
        categoryColor: categories.color,
        totalAmount: sql<number>`SUM(CAST(${expenses.amount} AS DECIMAL))`,
        expenseCount: sql<number>`COUNT(*)`,
      })
      .from(expenses)
      .innerJoin(categories, eq(expenses.categoryId, categories.id))
      .where(and(...whereConditions))
      .groupBy(
        expenses.categoryId,
        categories.name,
        categories.color
      )
      .orderBy(desc(sql`SUM(CAST(${expenses.amount} AS DECIMAL))`));

    // 计算总金额和百分比
    const totalAmount = results.reduce((sum: number, row: any) => sum + Number(row.totalAmount), 0);

    return results.map((row: any) => ({
      ...row,
      totalAmount: Number(row.totalAmount).toFixed(2),
      percentage: totalAmount > 0 ? (Number(row.totalAmount) / totalAmount * 100).toFixed(1) : '0',
    }));
  }

  /**
   * 获取月度开支统计
   */
  static async getMonthlyStatistics(
    userId: string,
    year: number
  ): Promise<MonthlyStatistics[]> {
    const results = await db
      .select({
        month: sql<number>`EXTRACT(MONTH FROM ${expenses.date})`,
        year: sql<number>`EXTRACT(YEAR FROM ${expenses.date})`,
        totalAmount: sql<number>`SUM(CAST(${expenses.amount} AS DECIMAL))`,
        expenseCount: sql<number>`COUNT(*)`,
      })
      .from(expenses)
      .where(and(
        eq(expenses.userId, userId),
        sql`EXTRACT(YEAR FROM ${expenses.date}) = ${year}`
      ))
      .groupBy(
        sql`EXTRACT(MONTH FROM ${expenses.date})`,
        sql`EXTRACT(YEAR FROM ${expenses.date})`
      )
      .orderBy(sql`EXTRACT(MONTH FROM ${expenses.date})`);

    return results.map((row: any) => ({
      month: `${row.year}-${String(row.month).padStart(2, '0')}`,
      year: row.year,
      totalAmount: Number(row.totalAmount).toFixed(2),
      expenseCount: row.expenseCount,
      categoryBreakdown: [], // 可以后续添加分类详情
    }));
  }

  /**
   * 删除用户的所有开支记录
   */
  static async deleteByUserId(userId: string): Promise<number> {
    const result = await db
      .delete(expenses)
      .where(eq(expenses.userId, userId));

    return result.rowCount;
  }
}
