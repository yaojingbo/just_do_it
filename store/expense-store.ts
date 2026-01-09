import { create } from 'zustand';
import { Expense, CreateExpenseInput, ApiResponse } from '@/types';

interface ExpenseStore {
  expenses: Expense[];
  isLoading: boolean;
  error: string | null;
  initialized: boolean;

  // API Actions
  fetchExpenses: () => Promise<void>;
  addExpense: (expense: CreateExpenseInput) => Promise<boolean>;
  updateExpense: (id: string, expense: Partial<CreateExpenseInput>) => Promise<boolean>;
  deleteExpense: (id: string) => Promise<boolean>;

  // Local queries
  getExpensesByCategory: (categoryId: string) => Expense[];
  getExpensesByDateRange: (startDate: Date, endDate: Date) => Expense[];

  // State management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearExpenses: () => void;
}

export const useExpenseStore = create<ExpenseStore>()((set, get) => ({
  expenses: [],
  isLoading: false,
  error: null,
  initialized: false,

  fetchExpenses: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/expenses');
      const result: ApiResponse<Expense[]> = await response.json();

      if (result.success && result.data) {
        // 转换日期字符串为Date对象
        const expenses = result.data.map(exp => ({
          ...exp,
          date: new Date(exp.date),
          createdAt: new Date(exp.createdAt),
          updatedAt: new Date(exp.updatedAt),
        }));
        set({ expenses, initialized: true });
      } else {
        set({ error: result.error || '获取开支列表失败' });
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '网络请求失败' });
    } finally {
      set({ isLoading: false });
    }
  },

  addExpense: async (expense) => {
    set({ isLoading: true, error: null });
    try {
      // 转换数据格式以符合API要求
      const expenseData = {
        amount: expense.amount,
        categoryId: expense.categoryId,
        description: expense.description,
        date: expense.date instanceof Date
          ? expense.date.toISOString()
          : new Date(expense.date).toISOString(),
      };

      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseData),
      });
      const result: ApiResponse<Expense> = await response.json();

      if (result.success && result.data) {
        const newExpense = {
          ...result.data,
          date: new Date(result.data.date),
          createdAt: new Date(result.data.createdAt),
          updatedAt: new Date(result.data.updatedAt),
        };
        set((state) => ({
          expenses: [newExpense, ...state.expenses],
        }));
        return true;
      } else {
        set({ error: result.error || '添加开支失败' });
        return false;
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '网络请求失败' });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  updateExpense: async (id, expense) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expense),
      });
      const result: ApiResponse<Expense> = await response.json();

      if (result.success && result.data) {
        const updatedExpense = {
          ...result.data,
          date: new Date(result.data.date),
          createdAt: new Date(result.data.createdAt),
          updatedAt: new Date(result.data.updatedAt),
        };
        set((state) => ({
          expenses: state.expenses.map((e) =>
            e.id === id ? updatedExpense : e
          ),
        }));
        return true;
      } else {
        set({ error: result.error || '更新开支失败' });
        return false;
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '网络请求失败' });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteExpense: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
      });
      const result: ApiResponse<void> = await response.json();

      if (result.success) {
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== id),
        }));
        return true;
      } else {
        set({ error: result.error || '删除开支失败' });
        return false;
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '网络请求失败' });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  getExpensesByCategory: (categoryId) => {
    return get().expenses.filter((e) => e.categoryId === categoryId);
  },

  getExpensesByDateRange: (startDate, endDate) => {
    return get().expenses.filter((e) => {
      const expenseDate = new Date(e.date);
      return expenseDate >= startDate && expenseDate <= endDate;
    });
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  setError: (error) => {
    set({ error });
  },

  clearExpenses: () => {
    set({ expenses: [], initialized: false });
  },
}));
