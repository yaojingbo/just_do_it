import { create } from 'zustand';
import { Category, CreateCategoryInput, ApiResponse } from '@/types';
import { PREDEFINED_CATEGORIES } from '@/constants';

interface CategoryStore {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  initialized: boolean;

  // API Actions
  fetchCategories: () => Promise<void>;
  addCategory: (category: CreateCategoryInput) => Promise<boolean>;
  updateCategory: (id: string, category: Partial<CreateCategoryInput>) => Promise<boolean>;
  deleteCategory: (id: string) => Promise<boolean>;

  // Local queries
  getCategoryById: (id: string) => Category | undefined;
  getPredefinedCategories: () => Category[];
  getUserCategories: () => Category[];

  // State management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useCategoryStore = create<CategoryStore>()((set, get) => ({
  categories: [], // 初始化为空，通过 fetchCategories 获取
  isLoading: false,
  error: null,
  initialized: false,

  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/categories');
      const result: ApiResponse<Category[]> = await response.json();

      if (result.success && result.data) {
        set({ categories: result.data, initialized: true });
      } else {
        // 如果API失败，使用预定义分类作为后备
        set({
          categories: [...PREDEFINED_CATEGORIES],
          error: result.error || '获取分类列表失败',
          initialized: true
        });
      }
    } catch (error) {
      // 网络错误时使用预定义分类
      set({
        categories: [...PREDEFINED_CATEGORIES],
        error: error instanceof Error ? error.message : '网络请求失败',
        initialized: true
      });
    } finally {
      set({ isLoading: false });
    }
  },

  addCategory: async (category) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category),
      });
      const result: ApiResponse<Category> = await response.json();

      if (result.success && result.data) {
        set((state) => ({
          categories: [...state.categories, result.data!],
        }));
        return true;
      } else {
        set({ error: result.error || '添加分类失败' });
        return false;
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '网络请求失败' });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  updateCategory: async (id, category) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category),
      });
      const result: ApiResponse<Category> = await response.json();

      if (result.success && result.data) {
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? result.data! : c
          ),
        }));
        return true;
      } else {
        set({ error: result.error || '更新分类失败' });
        return false;
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '网络请求失败' });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteCategory: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      });
      const result: ApiResponse<void> = await response.json();

      if (result.success) {
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        }));
        return true;
      } else {
        set({ error: result.error || '删除分类失败' });
        return false;
      }
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '网络请求失败' });
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  getCategoryById: (id) => {
    return get().categories.find((c) => c.id === id);
  },

  getPredefinedCategories: () => {
    return get().categories.filter((c) => c.isPredefined);
  },

  getUserCategories: () => {
    return get().categories.filter((c) => !c.isPredefined);
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  setError: (error) => {
    set({ error });
  },
}));
