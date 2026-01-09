export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
  isPredefined: boolean;
}

export interface Expense {
  id: string;
  amount: number;
  categoryId: string;
  description: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateExpenseInput {
  amount: number;
  categoryId: string;
  description: string;
  date: Date;
}

export interface UpdateExpenseInput extends Partial<CreateExpenseInput> {
  id: string;
}

export interface CreateCategoryInput {
  name: string;
  slug: string;
  color: string;
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {
  id: string;
}

export interface ExpenseWithCategory extends Expense {
  category: Category;
}

export interface CategoryStatistics {
  category: string;
  amount: number;
  percentage: number;
  count: number;
  color: string;
}

export interface MonthlyStatistics {
  month: string;
  total: number;
  categoryBreakdown: CategoryStatistics[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface Session {
  userId: string;
  email: string;
  name: string;
  role: string;
}
