import { create } from 'zustand';
import { Session } from '@/lib/auth/session';
import { ApiResponse } from '@/types';

interface AuthStore {
  user: Session | null;
  isLoading: boolean;
  error: string | null;
  initialized: boolean;

  // Actions
  register: (data: { email: string; password: string; name: string }) => Promise<boolean>;
  login: (data: { email: string; password: string }) => Promise<boolean>;
  logout: () => Promise<boolean>;
  fetchSession: () => Promise<boolean>;
  clearError: () => void;

  // Computed
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthStore>()((set, get) => ({
  user: null,
  isLoading: false,
  error: null,
  initialized: false,

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result: ApiResponse<any> = await response.json();

      if (result.success && result.data) {
        set({ user: result.data.session, isLoading: false, initialized: true });
        return true;
      } else {
        set({ error: result.error || '注册失败', isLoading: false });
        return false;
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '网络请求失败',
        isLoading: false,
      });
      return false;
    }
  },

  login: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result: ApiResponse<any> = await response.json();

      if (result.success && result.data) {
        set({ user: result.data.session, isLoading: false, initialized: true });
        return true;
      } else {
        set({ error: result.error || '登录失败', isLoading: false });
        return false;
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '网络请求失败',
        isLoading: false,
      });
      return false;
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      const result: ApiResponse<void> = await response.json();

      set({ user: null, isLoading: false, initialized: true });

      // 清除本地存储（如果有）
      localStorage.removeItem('auth-token');

      return result.success;
    } catch (error) {
      // 即使失败也清除本地状态
      set({ user: null, isLoading: false, error: null });
      return true;
    }
  },

  fetchSession: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/auth/session');
      const result: ApiResponse<Session> = await response.json();

      if (result.success && result.data) {
        set({ user: result.data, isLoading: false, initialized: true });
        return true;
      } else {
        set({ user: null, isLoading: false, initialized: true });
        return false;
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '获取会话失败',
        user: null,
        isLoading: false,
        initialized: true,
      });
      return false;
    }
  },

  clearError: () => {
    set({ error: null });
  },

  isAuthenticated: () => {
    return !!get().user;
  },
}));
