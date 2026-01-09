import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// ===============================
// Environment Variables
// ===============================

const DATABASE_URL = process.env.DATABASE_URL;
const NEON_DATABASE_URL = process.env.NEON_DATABASE_URL;
const NEON_API_KEY = process.env.NEON_API_KEY;

if (!DATABASE_URL && !NEON_DATABASE_URL) {
  console.warn(
    'DATABASE_URL or NEON_DATABASE_URL environment variable is not set. Using mock mode.'
  );
}

// ===============================
// Database Connection
// ===============================

// For Neon HTTP connection (serverless/edge environments)
let sqlConnection: any = null;
let dbInstance: any = null;

if (DATABASE_URL || (NEON_DATABASE_URL && NEON_API_KEY)) {
  try {
    sqlConnection = neon(
      DATABASE_URL ||
        `postgres://${NEON_DATABASE_URL}.neon.tech:${NEON_API_KEY}?sslmode=require`
    );
    dbInstance = drizzle(sqlConnection, { schema });
  } catch (error) {
    console.warn('Failed to initialize database connection:', error);
  }
}

// Export database instance (may be null if no DB configured)
export const sql = sqlConnection;
export const db = dbInstance;

// ===============================
// Database Utilities
// ===============================

/**
 * Execute a database transaction
 */
export async function transaction<T>(
  callback: (tx: typeof db) => Promise<T>
): Promise<T> {
  return db.transaction(callback);
}

/**
 * Health check for database connection
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    if (!DATABASE_URL && !NEON_DATABASE_URL) {
      return false;
    }
    await sql`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

/**
 * Close database connection (for cleanup)
 */
export async function closeConnection(): Promise<void> {
  // For Neon HTTP connection, no explicit close is needed
  // The connection is automatically closed after each request
}

// ===============================
// Query Builders
// ===============================

import { and, or, eq, ne, gt, gte, lt, lte, like, ilike, inArray, isNull, isNotNull } from 'drizzle-orm';

/**
 * Build where conditions for queries
 */
export const conditions = {
  and,
  or,
  eq,
  ne,
  gt,
  gte,
  lt,
  lte,
  like,
  ilike,
  inArray,
  isNull,
  isNotNull,
};

// ===============================
// Expense-specific query helpers
// ===============================

/**
 * Get expenses with category information
 */
export async function getExpensesWithCategory(userId: string, filters?: {
  categoryId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  offset?: number;
}) {
  const { categories, expenses } = schema;
  const query = db
    .select({
      expense: expenses,
      category: {
        id: categories.id,
        name: categories.name,
        color: categories.color,
        isPredefined: categories.isPredefined,
      },
    })
    .from(expenses)
    .leftJoin(categories, eq(expenses.categoryId, categories.id))
    .where(eq(expenses.userId, userId));

  // Apply filters
  const whereConditions = [];

  if (filters?.categoryId) {
    whereConditions.push(eq(expenses.categoryId, filters.categoryId));
  }

  if (filters?.dateFrom) {
    whereConditions.push(gte(expenses.date, filters.dateFrom));
  }

  if (filters?.dateTo) {
    whereConditions.push(lte(expenses.date, filters.dateTo));
  }

  if (whereConditions.length > 0) {
    query.where(and(...whereConditions));
  }

  // Apply ordering, limit, offset
  query
    .orderBy(expenses.date)
    .limit(filters?.limit || 50)
    .offset(filters?.offset || 0);

  const results = await query;
  return results.map((row: any) => ({
    ...row.expense,
    category: row.category,
  }));
}

/**
 * Get expense statistics by category
 */
export async function getExpenseStatisticsByCategory(userId: string, dateFrom?: Date, dateTo?: Date) {
  const { expenses, categories } = schema;

  const query = db
    .select({
      categoryId: expenses.categoryId,
      categoryName: categories.name,
      categoryColor: categories.color,
      totalAmount: expenses.amount,
      expenseCount: expenses.id,
    })
    .from(expenses)
    .innerJoin(categories, eq(expenses.categoryId, categories.id))
    .where(eq(expenses.userId, userId));

  const whereConditions = [];

  if (dateFrom) {
    whereConditions.push(gte(expenses.date, dateFrom));
  }

  if (dateTo) {
    whereConditions.push(lte(expenses.date, dateTo));
  }

  if (whereConditions.length > 0) {
    query.where(and(...whereConditions));
  }

  const results = await query;

  // Group by category
  const categoryMap = new Map();

  for (const row of results) {
    const key = row.categoryId;
    if (!categoryMap.has(key)) {
      categoryMap.set(key, {
        categoryId: row.categoryId,
        categoryName: row.categoryName,
        categoryColor: row.categoryColor,
        totalAmount: 0,
        expenseCount: 0,
      });
    }

    const category = categoryMap.get(key);
    category.totalAmount += Number(row.totalAmount);
    category.expenseCount += 1;
  }

  return Array.from(categoryMap.values());
}

/**
 * Get monthly expense statistics
 */
export async function getMonthlyExpenseStatistics(userId: string, year: number) {
  const { expenses } = schema;

  const results = await db
    .select({
      month: expenses.date,
      totalAmount: expenses.amount,
    })
    .from(expenses)
    .where(eq(expenses.userId, userId))
    .orderBy(expenses.date);

  // Group by month
  const monthMap = new Map();

  for (const row of results) {
    const monthKey = new Date(row.month).getMonth() + 1; // 1-12
    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, {
        month: monthKey,
        year,
        totalAmount: 0,
        expenseCount: 0,
      });
    }

    const month = monthMap.get(monthKey);
    month.totalAmount += Number(row.totalAmount);
    month.expenseCount += 1;
  }

  return Array.from(monthMap.values());
}

// ===============================
// Export Types
// ===============================

export type Database = typeof db;
export { schema };
