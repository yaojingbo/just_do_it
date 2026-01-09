import {
  pgTable,
  uuid,
  varchar,
  text,
  numeric,
  timestamp,
  boolean,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================================================
// USERS TABLE
// ============================================================================

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull(),
  password: varchar('password', { length: 255 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  role: varchar('role', { length: 20 }).default('user').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
}, (table) => ({
  // Unique index on email for login lookups
  emailUniqueIdx: uniqueIndex('uniq_users_email').on(table.email),
  // Index on created_at for user queries
  createdAtIdx: index('idx_users_created_at').on(table.createdAt),
}));

// ============================================================================
// CATEGORIES TABLE
// ============================================================================

export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(), // References users.id
  name: varchar('name', { length: 50 }).notNull(),
  slug: varchar('slug', { length: 50 }).notNull(),
  color: varchar('color', { length: 7 }).default('#6366f1').notNull(),
  isPredefined: boolean('is_predefined').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
}, (table) => ({
  // Ensure each user has unique category slugs
  userSlugUniqueIdx: uniqueIndex('uniq_categories_user_slug').on(
    table.userId,
    table.slug
  ),
  // Index on user_id for user queries
  userIdx: index('idx_categories_user').on(table.userId),
  // Index on is_predefined for filtering
  predefinedIdx: index('idx_categories_predefined').on(table.isPredefined),
}));

// ============================================================================
// EXPENSES TABLE
// ============================================================================

export const expenses = pgTable('expenses', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(), // References users.id
  categoryId: uuid('category_id').notNull(), // References categories.id
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  description: text('description').notNull(),
  date: timestamp('date', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
}, (table) => ({
  // Index on user_id for user queries
  userIdx: index('idx_expenses_user').on(table.userId),
  // Composite index for user + date range queries
  userDateIdx: index('idx_expenses_user_date').on(table.userId, table.date),
  // Index on category_id for category queries
  categoryIdx: index('idx_expenses_category').on(table.categoryId),
  // Index on date for time-based queries
  dateIdx: index('idx_expenses_date').on(table.date),
}));

// ============================================================================
// ACCESS LOGS TABLE (实现 C4 约束)
// ============================================================================

export const accessLogs = pgTable('access_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id'), // References users.id (nullable for anonymous users)
  action: varchar('action', { length: 100 }).notNull(),
  resource: varchar('resource', { length: 100 }).notNull(),
  resourceId: varchar('resource_id', { length: 100 }).notNull(),
  ipAddress: varchar('ip_address', { length: 45 }), // IPv6 compatible
  userAgent: text('user_agent'),
  success: boolean('success').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
}, (table) => ({
  // Index on user_id for user audit queries
  userIdx: index('idx_access_logs_user').on(table.userId),
  // Index on action for action-based queries
  actionIdx: index('idx_access_logs_action').on(table.action),
  // Index on created_at for time-based queries
  createdAtIdx: index('idx_access_logs_created_at').on(table.createdAt),
}));

// ============================================================================
// RELATIONS
// ============================================================================

// Define relationships for easier querying with Drizzle
export const usersRelations = relations(users, ({ many }) => ({
  expenses: many(expenses),
  categories: many(categories),
  accessLogs: many(accessLogs),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  // Category belongs to a user
  user: one(users, {
    fields: [categories.userId],
    references: [users.id],
  }),
  // Category has many expenses
  expenses: many(expenses),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  // Expense belongs to a user
  user: one(users, {
    fields: [expenses.userId],
    references: [users.id],
  }),
  // Expense belongs to a category
  category: one(categories, {
    fields: [expenses.categoryId],
    references: [categories.id],
  }),
}));

export const accessLogsRelations = relations(accessLogs, ({ one }) => ({
  // Access log belongs to a user (nullable)
  user: one(users, {
    fields: [accessLogs.userId],
    references: [users.id],
  }),
}));

// ============================================================================
// TYPE EXPORTS
// ============================================================================

// Type definitions for use in TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;

export type AccessLog = typeof accessLogs.$inferSelect;
export type NewAccessLog = typeof accessLogs.$inferInsert;

// Combined types for queries
export type ExpenseWithCategory = Expense & {
  category: Category;
};

export type ExpenseWithUser = Expense & {
  user: User;
};

export type CategoryWithExpenseCount = Category & {
  expenseCount: number;
};

// ============================================================================
// BUSINESS CONSTRAINTS (from real.md)
// ============================================================================

/**
 * C1: User data encryption storage
 * Implementation: Passwords are stored as hashed values (bcrypt)
 * Location: Application layer (auth service)
 * Validation: Unit tests verify plaintext passwords are never stored
 */

/**
 * C2: Authentication and authorization
 * Implementation: All API routes must verify user_id matches
 * Location: API middleware
 * Validation: Integration tests verify cross-user access is rejected
 */

/**
 * C3: Data integrity validation
 * Implementation: Zod schemas validate all user inputs
 * Location: validations/*.ts
 * Validation: Unit tests verify all validation rules
 */

/**
 * C4: Access logging
 * Implementation: Critical operations write to access_logs table
 * Location: services/log.service.ts
 * Validation: Integration tests verify log record completeness
 */
