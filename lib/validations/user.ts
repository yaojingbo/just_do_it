import { z } from 'zod';

// 用户创建验证
export const createUserSchema = z.object({
  email: z
    .string()
    .min(1, '邮箱不能为空')
    .email('请输入有效的邮箱地址')
    .max(255, '邮箱长度不能超过255个字符'),
  password: z
    .string()
    .min(6, '密码至少需要6个字符')
    .max(100, '密码长度不能超过100个字符'),
  name: z
    .string()
    .min(1, '姓名不能为空')
    .max(100, '姓名长度不能超过100个字符'),
  role: z
    .enum(['user', 'admin'])
    .optional()
    .default('user'),
});

// 用户更新验证
export const updateUserSchema = z.object({
  name: z
    .string()
    .min(1, '姓名不能为空')
    .max(100, '姓名长度不能超过100个字符')
    .optional(),
  email: z
    .string()
    .min(1, '邮箱不能为空')
    .email('请输入有效的邮箱地址')
    .max(255, '邮箱长度不能超过255个字符')
    .optional(),
});

// 用户登录验证
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, '邮箱不能为空')
    .email('请输入有效的邮箱地址'),
  password: z
    .string()
    .min(1, '密码不能为空'),
});

// 密码更改验证
export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, '当前密码不能为空'),
  newPassword: z
    .string()
    .min(6, '新密码至少需要6个字符')
    .max(100, '新密码长度不能超过100个字符'),
  confirmPassword: z
    .string()
    .min(1, '请确认新密码'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: '两次输入的密码不一致',
  path: ['confirmPassword'],
});

// 导出类型
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
