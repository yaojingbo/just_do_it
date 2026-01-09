export const APP_NAME = '家庭开销记录器';

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

export const DATE_FORMATS = {
  SHORT: 'yyyy-MM-dd',
  MEDIUM: 'yyyy年MM月dd日',
  LONG: 'yyyy年MM月dd日 HH:mm',
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

export const EXPENSE_LIMITS = {
  MAX_AMOUNT: 1000000,
  MIN_AMOUNT: 0.01,
  MAX_DESCRIPTION_LENGTH: 500,
} as const;

export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
} as const;

export const API_ENDPOINTS = {
  EXPENSES: '/api/expenses',
  CATEGORIES: '/api/categories',
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    SESSION: '/api/auth/session',
  },
  STATISTICS: '/api/statistics',
} as const;
