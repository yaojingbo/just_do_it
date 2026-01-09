import { z } from 'zod';

// 颜色验证（十六进制颜色码）
const colorSchema = z.string().regex(/^#[0-9A-Fa-f]{6}$/, '颜色必须为十六进制格式，如#FF0000');

// 分类创建验证
export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, '分类名称不能为空')
    .max(50, '分类名称长度不能超过50个字符'),
  slug: z
    .string()
    .min(1, '分类标识不能为空')
    .max(50, '分类标识长度不能超过50个字符')
    .regex(/^[a-z0-9-]+$/, '分类标识只能包含小写字母、数字和连字符'),
  color: colorSchema,
});

// 分类更新验证
export const updateCategorySchema = z.object({
  id: z
    .string()
    .uuid('无效的分类ID'),
  name: z
    .string()
    .min(1, '分类名称不能为空')
    .max(50, '分类名称长度不能超过50个字符')
    .optional(),
  slug: z
    .string()
    .min(1, '分类标识不能为空')
    .max(50, '分类标识长度不能超过50个字符')
    .regex(/^[a-z0-9-]+$/, '分类标识只能包含小写字母、数字和连字符')
    .optional(),
  color: colorSchema.optional(),
});

// 分类列表查询验证
export const categoryListQuerySchema = z.object({
  includePredefined: z
    .string()
    .transform((val) => val === 'true')
    .optional()
    .default('true'),
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
    .default('50'),
  sortBy: z
    .enum(['name', 'createdAt'])
    .optional()
    .default('name'),
  sortOrder: z
    .enum(['asc', 'desc'])
    .optional()
    .default('asc'),
});

// 导出类型
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CategoryListQueryInput = z.infer<typeof categoryListQuerySchema>;
