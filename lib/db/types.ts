import { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { users, categories, expenses } from './schema';

// ===============================
// Select Types (From Database)
// ===============================

export type User = InferSelectModel<typeof users>;
export type Category = InferSelectModel<typeof categories>;
export type Expense = InferSelectModel<typeof expenses>;

// ===============================
// Insert Types (To Database)
// ===============================

export type NewUser = InferInsertModel<typeof users>;
export type NewCategory = InferInsertModel<typeof categories>;
export type NewExpense = InferInsertModel<typeof expenses>;

// ===============================
// Extended Types (With Relations)
// ===============================

export type ExpenseWithCategory = Expense & {
  category: Category;
};

export type CategoryWithExpenseCount = Category & {
  expenseCount: number;
  totalAmount: string;
};

// ===============================
// Query Result Types
// ===============================

export type ExpenseListItem = {
  id: string;
  amount: string;
  description: string;
  date: Date;
  category: {
    id: string;
    name: string;
    color: string;
  };
};

export type CategoryStatistics = {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  totalAmount: string;
  expenseCount: number;
  percentage: number;
};

export type MonthlyStatistics = {
  month: string;
  year: number;
  totalAmount: string;
  expenseCount: number;
  categoryBreakdown: CategoryStatistics[];
};

export type DashboardStats = {
  totalExpenses: number;
  totalAmount: string;
  thisMonthExpenses: number;
  thisMonthAmount: string;
  averageDailyAmount: string;
  categoryCount: number;
};

// ===============================
// Form/Validation Types
// ===============================

export type CreateExpenseInput = {
  amount: number;
  categoryId: string;
  description: string;
  date: Date;
};

export type UpdateExpenseInput = Partial<CreateExpenseInput> & {
  id: string;
};

export type CreateCategoryInput = {
  name: string;
  slug: string;
  color: string;
};

export type UpdateCategoryInput = Partial<CreateCategoryInput> & {
  id: string;
};

export type CreateUserInput = {
  email: string;
  name: string;
  password: string;
};

export type UpdateUserInput = {
  name?: string;
  email?: string;
  password?: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

// ===============================
// Search and Filter Types
// ===============================

export type ExpenseSearchFilters = {
  categoryId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  minAmount?: number;
  maxAmount?: number;
  searchQuery?: string;
};

export type ExpenseListQuery = {
  page?: number;
  limit?: number;
  sortBy?: 'date' | 'amount' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  categoryId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
};

// ===============================
// API Response Types
// ===============================

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};

export type PaginatedResult<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

export type ExpenseListResponse = PaginatedResult<ExpenseWithCategory>;
export type CategoryListResponse = PaginatedResult<Category>;

// ===============================
// Utility Types
// ===============================

export type DatabaseConnection = {
  query: any;
  execute: any;
  transaction: any;
};

export type QueryOptions = {
  limit?: number;
  offset?: number;
  orderBy?: 'asc' | 'desc';
  orderField?: string;
};

export type TransactionCallback<T> = (tx: DatabaseConnection) => Promise<T>;

// ===============================
// Constants
// ===============================

export const PREDEFINED_CATEGORIES = [
  { id: 'food-1', name: '食物餐饮', slug: 'food', color: '#ef4444', isPredefined: true },
  { id: 'transport-1', name: '交通出行', slug: 'transport', color: '#3b82f6', isPredefined: true },
  { id: 'housing-1', name: '住房水电', slug: 'housing', color: '#10b981', isPredefined: true },
  { id: 'shopping-1', name: '服装购物', slug: 'shopping', color: '#f59e0b', isPredefined: true },
  { id: 'entertainment-1', name: '娱乐休闲', slug: 'entertainment', color: '#8b5cf6', isPredefined: true },
  { id: 'healthcare-1', name: '医疗健康', slug: 'healthcare', color: '#ec4899', isPredefined: true },
  { id: 'education-1', name: '学习教育', slug: 'education', color: '#06b6d4', isPredefined: true },
  { id: 'investment-1', name: '投资储蓄', slug: 'investment', color: '#059669', isPredefined: true },
  { id: 'others-1', name: '其他杂项', slug: 'others', color: '#6b7280', isPredefined: true },
] as const;

export type PredefinedCategoryId = typeof PREDEFINED_CATEGORIES[number]['id'];
