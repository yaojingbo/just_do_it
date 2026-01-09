import { z } from 'zod';

// 开支持续创建验证
export const createExpenseSchema = z.object({
  amount: z
    .number()
    .min(0.01, '金额必须大于0')
    .max(1000000, '金额不能超过100万元'),
  categoryId: z
    .string()
    .uuid('无效的分类ID'),
  description: z
    .string()
    .min(1, '描述不能为空')
    .max(500, '描述长度不能超过500个字符'),
  date: z
    .string()
    .refine((val) => {
      const date = new Date(val);
      return !isNaN(date.getTime()) && date <= new Date();
    }, '日期格式无效或不能是未来时间'),
});

// 开支持续更新验证
export const updateExpenseSchema = z.object({
  id: z
    .string()
    .uuid('无效的开支ID'),
  amount: z
    .number()
    .min(0.01, '金额必须大于0')
    .max(1000000, '金额不能超过100万元')
    .optional(),
  categoryId: z
    .string()
    .uuid('无效的分类ID')
    .optional(),
  description: z
    .string()
    .min(1, '描述不能为空')
    .max(500, '描述长度不能超过500个字符')
    .optional(),
  date: z
    .string()
    .refine((val) => {
      if (!val) return true;
      const date = new Date(val);
      return !isNaN(date.getTime()) && date <= new Date();
    }, '日期格式无效或不能是未来时间')
    .optional()
});

// 开支持续列表查询验证
export const expenseListQuerySchema = z.object({
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0, '页码必须大于0')
    .optional()
    .default('1'),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 0 && val <= 100, '每页数量必须在1-100之间')
    .optional()
    .default('20'),
  sortBy: z
    .enum(['date', 'amount', 'createdAt'])
    .optional()
    .default('date'),
  sortOrder: z
    .enum(['asc', 'desc'])
    .optional()
    .default('desc'),
  categoryId: z
    .string()
    .uuid('无效的分类ID')
    .optional(),
  dateFrom: z
    .string()
    .datetime('无效的开始日期格式')
    .optional(),
  dateTo: z
    .string()
    .datetime('无效的结束日期格式')
    .optional(),
  search: z
    .string()
    .max(200, '搜索关键词长度不能超过200个字符')
    .optional(),
});

// 统计数据查询验证
export const statisticsQuerySchema = z.object({
  dateFrom: z
    .string()
    .datetime('无效的开始日期格式')
    .optional(),
  dateTo: z
    .string()
    .datetime('无效的结束日期格式')
    .optional(),
  groupBy: z
    .enum(['category', 'month', 'year'])
    .optional()
    .default('category'),
});

// 月度统计查询验证
export const monthlyStatsSchema = z.object({
  year: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val > 2000 && val <= new Date().getFullYear(), '无效的年份'),
  month: z
    .string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => val >= 1 && val <= 12, '月份必须在1-12之间')
    .optional(),
});

// 导出类型
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
export type ExpenseListQueryInput = z.infer<typeof expenseListQuerySchema>;
export type StatisticsQueryInput = z.infer<typeof statisticsQuerySchema>;
export type MonthlyStatsInput = z.infer<typeof monthlyStatsSchema>;
