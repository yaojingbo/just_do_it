# 集成指南

## 项目概述

本文档描述了如何集成和使用家庭开销记录器系统。该系统是一个基于 Next.js 的全栈 Web 应用，提供用户认证、开支持续管理和数据统计功能。

## 技术栈

### 前端
- **框架：** Next.js 15 + React 18
- **语言：** TypeScript（严格模式）
- **样式：** Tailwind CSS
- **UI 组件：** shadcn/ui
- **状态管理：** Zustand
- **表单处理：** React Hook Form + Zod
- **图标库：** Lucide React

### 后端
- **API：** Next.js API Routes
- **数据库：** PostgreSQL (Neon)
- **ORM：** Drizzle ORM
- **认证：** Session-based 认证
- **密码加密：** bcryptjs
- **数据验证：** Zod

### 开发工具
- **包管理器：** npm
- **构建工具：** Next.js
- **迁移工具：** tsx
- **类型检查：** TypeScript
- **代码质量：** ESLint

---

## 架构设计

### 系统架构图

```
┌─────────────────────────────────────────────────────────────┐
│                    客户端层 (Client)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   注册页     │  │   登录页     │  │   主页      │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP + Cookie
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Next.js 服务器层                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  认证 API   │  │  开支 API   │  │  分类 API   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ 中间件层     │  │ 验证层      │  │ 错误处理     │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   服务层 (Services)                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ 认证服务     │  │  DAO 层     │  │  日志服务    │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   数据访问层 (DAO)                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ UserDAO     │  │ ExpenseDAO │  │ CategoryDAO │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   数据存储层 (Database)                      │
│              PostgreSQL (Neon)                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │    users    │  │  expenses  │  │ categories │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│  ┌─────────────┐                                          │
│  │access_logs │                                          │
│  └─────────────┘                                          │
└─────────────────────────────────────────────────────────────┘
```

### 认证流程

```
1. 用户注册
   ┌─────────────┐
   │  POST /api  │
   │ /auth/register         │
   └──────┬──────┘
          │
          ▼
   ┌─────────────┐
   │ 验证输入     │
   │ 加密密码     │
   └──────┬──────┘
          │
          ▼
   ┌─────────────┐
   │ 创建用户     │
   │ 设置会话     │
   └──────┬──────┘
          │
          ▼
   ┌─────────────┐
   │ 返回响应     │
   │ 设置 Cookie  │
   └─────────────┘

2. 用户登录
   ┌─────────────┐
   │  POST /api  │
   │  /auth/login          │
   └──────┬──────┘
          │
          ▼
   ┌─────────────┐
   │ 验证凭据     │
   └──────┬──────┘
          │
          ▼
   ┌─────────────┐
   │ 创建会话     │
   └──────┬──────┘
          │
          ▼
   ┌─────────────┐
   │ 返回响应     │
   │ 设置 Cookie  │
   └─────────────┘

3. 后续请求
   ┌─────────────┐
   │ 发送请求     │
   │ + Cookie    │
   └──────┬──────┘
          │
          ▼
   ┌─────────────┐
   │ 中间件验证   │
   └──────┬──────┘
          │
          ▼
   ┌─────────────┐
   │ 执行业务逻辑  │
   └──────┬──────┘
          │
          ▼
   ┌─────────────┐
   │ 返回数据     │
   └─────────────┘
```

---

## 文件结构

```
task002/
├── app/                          # Next.js App Router
│   ├── api/                      # API 路由
│   │   ├── auth/                 # 认证接口
│   │   │   ├── register/         # 用户注册
│   │   │   │   └── route.ts
│   │   │   ├── login/            # 用户登录
│   │   │   │   └── route.ts
│   │   │   ├── logout/           # 用户登出
│   │   │   │   └── route.ts
│   │   │   └── session/          # 会话查询
│   │   │       └── route.ts
│   │   ├── expenses/             # 开支接口
│   │   │   └── route.ts
│   │   └── categories/           # 分类接口
│   │       └── route.ts
│   ├── (auth)/                   # 认证页面组
│   │   ├── login/                # 登录页
│   │   │   └── page.tsx
│   │   └── register/             # 注册页
│   │       └── page.tsx
│   ├── globals.css               # 全局样式
│   ├── layout.tsx                # 根布局
│   └── page.tsx                  # 首页
│
├── components/                    # React 组件
│   ├── auth/                     # 认证组件
│   │   ├── LoginForm.tsx         # 登录表单
│   │   └── RegisterForm.tsx      # 注册表单
│   └── ui/                       # 基础 UI 组件
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       └── badge.tsx
│
├── lib/                          # 核心库
│   ├── auth/                     # 认证相关
│   │   ├── auth.service.ts       # 认证业务逻辑
│   │   ├── session.ts            # 会话管理
│   │   ├── password.ts           # 密码工具
│   │   └── middleware/           # 中间件
│   │       └── auth.ts           # 认证中间件
│   │
│   ├── db/                       # 数据库层
│   │   ├── connection.ts         # 数据库连接
│   │   ├── schema.ts             # Drizzle Schema
│   │   ├── user-dao.ts          # 用户数据访问
│   │   ├── expense-dao.ts        # 开支数据访问
│   │   ├── category-dao.ts       # 分类数据访问
│   │   └── types.ts              # 数据库类型
│   │
│   ├── validations/              # 数据验证
│   │   ├── user.ts               # 用户验证
│   │   ├── expense.ts            # 开支验证
│   │   └── category.ts           # 分类验证
│   │
│   ├── services/                  # 服务层
│   │   └── log.service.ts        # 日志服务
│   │
│   ├── errors.ts                 # 错误处理
│   └── utils.ts                  # 工具函数
│
├── store/                        # Zustand 状态管理
│   ├── auth-store.ts            # 认证状态
│   ├── expense-store.ts         # 开支状态
│   └── category-store.ts        # 分类状态
│
├── hooks/                        # 自定义 Hooks
│   └── use-auth.ts              # 认证 Hook
│
├── constants/                    # 常量定义
│   └── index.ts                 # 常量
│
├── types/                        # TypeScript 类型
│   └── index.ts                 # 类型定义
│
├── scripts/                      # 脚本
│   └── migrate.ts               # 数据库迁移
│
├── public/                       # 静态资源
│   └── favicon.ico
│
├── .env                          # 环境变量
├── .env.example                  # 环境变量模板
├── .gitignore
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts
├── drizzle.config.ts
├── README.md
└── API_DOCUMENTATION.md          # API 文档
```

---

## 核心功能

### 1. 用户认证系统

#### 特性
- **注册/登录/登出** - 完整的用户生命周期管理
- **会话管理** - 基于 Cookie 的安全会话
- **密码安全** - bcryptjs 哈希加密
- **数据隔离** - 用户间数据完全隔离

#### 认证流程
1. 用户提交注册信息
2. 服务端验证数据格式
3. 检查邮箱是否已存在
4. 加密密码并创建用户
5. 创建会话并返回 Cookie
6. 后续请求通过 Cookie 验证身份

#### 安全措施
- httpOnly Cookie 防止 XSS
- 密码哈希存储
- 会话超时机制
- SQL 注入防护（Drizzle ORM）
- 输入验证（Zod）

### 2. 开支管理

#### 功能
- **创建开支** - 添加新的开支记录
- **查询开支** - 按条件筛选和分页
- **分类管理** - 9个预定义分类
- **数据统计** - 实时计算总开支等

#### 数据模型
```typescript
Expense {
  id: string;              // UUID
  userId: string;          // 用户ID
  categoryId: string;      // 分类ID
  amount: number;          // 金额
  description: string;     // 描述
  date: string;            // 日期
  createdAt: string;       // 创建时间
  updatedAt: string;      // 更新时间
}
```

### 3. 分类系统

#### 预定义分类
1. 食物餐饮 (#ef4444)
2. 交通出行 (#3b82f6)
3. 住房水电 (#10b981)
4. 娱乐休闲 (#8b5cf6)
5. 服装购物 (#f59e0b)
6. 医疗健康 (#ec4899)
7. 学习教育 (#06b6d4)
8. 投资储蓄 (#059669)
9. 其他杂项 (#6b7280)

#### 特点
- 所有用户共享预定义分类
- 分类不可删除，仅可使用
- 颜色编码便于识别
- 支持按分类筛选开支

---

## 安装和设置

### 前置要求
- Node.js 18+
- npm 9+
- PostgreSQL 数据库（推荐 Neon 云数据库）

### 1. 克隆项目
```bash
cd /Users/Zhuanz/code/task002
```

### 2. 安装依赖
```bash
npm install
```

### 3. 环境配置

复制环境变量模板：
```bash
cp .env.example .env
```

编辑 `.env` 文件：
```bash
# 数据库配置
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"

# Node 环境
NODE_ENV="development"
```

### 4. 数据库设置

#### 使用 Neon（推荐）
1. 访问 [Neon](https://neon.tech/)
2. 创建免费账户
3. 创建新项目
4. 复制连接字符串到 `.env`

#### 使用本地 PostgreSQL
```bash
# 创建数据库
createdb expense_tracker

# 更新 .env
DATABASE_URL="postgresql://username:password@localhost:5432/expense_tracker"
```

### 5. 数据库迁移
```bash
npm run migrate
```

### 6. 启动开发服务器
```bash
npm run dev
```

访问 http://localhost:3000

---

## 开发指南

### 开发流程

#### 1. 启动开发环境
```bash
npm run dev          # 启动开发服务器
npm run migrate      # 数据库迁移（首次或更新后）
npm run test:api     # API 测试
```

#### 2. 添加新 API

**步骤1：创建路由文件**
```typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // 处理 GET 请求
  return NextResponse.json({ success: true, data: {} });
}

export async function POST(request: NextRequest) {
  // 处理 POST 请求
  const body = await request.json();
  return NextResponse.json({ success: true, data: body });
}
```

**步骤2：添加数据验证**
```typescript
// lib/validations/example.ts
import { z } from 'zod';

export const ExampleSchema = z.object({
  field: z.string().min(1),
});

export type ExampleInput = z.infer<typeof ExampleSchema>;
```

**步骤3：创建 DAO**
```typescript
// lib/db/example-dao.ts
import { db } from './connection';
import { ExampleSchema } from '@/lib/validations/example';

export class ExampleDAO {
  static async create(data: ExampleInput) {
    // 实现
  }

  static async findByUserId(userId: string) {
    // 实现
  }
}
```

#### 3. 添加前端页面

**步骤1：创建页面组件**
```typescript
// app/example/page.tsx
'use client';

import { useState } from 'react';

export default function ExamplePage() {
  const [data, setData] = useState(null);

  return (
    <div>
      {/* 页面内容 */}
    </div>
  );
}
```

**步骤2：添加状态管理**
```typescript
// store/example-store.ts
import { create } from 'zustand';

interface ExampleState {
  data: any;
  fetchData: () => Promise<void>;
}

export const useExampleStore = create<ExampleState>((set) => ({
  data: null,
  fetchData: async () => {
    // 实现
  },
}));
```

#### 4. 数据库变更

**修改 Schema**
```typescript
// lib/db/schema.ts
import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';

export const example = pgTable('example', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
```

**创建迁移脚本**
```typescript
// scripts/migrate.ts
await sql`
  ALTER TABLE example
  ADD COLUMN name VARCHAR(255) NOT NULL
`;
```

---

## API 集成示例

### 1. 前端集成

#### React Hook 示例
```typescript
// hooks/use-expenses.ts
'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';

export function useExpenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      fetchExpenses();
    }
  }, [user]);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/expenses');
      const result = await response.json();

      if (result.success) {
        setExpenses(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const createExpense = async (data: any) => {
    const response = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (result.success) {
      setExpenses([...expenses, result.data]);
    }

    return result;
  };

  return {
    expenses,
    loading,
    createExpense,
    fetchExpenses,
  };
}
```

#### 表单集成
```typescript
// components/ExpenseForm.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const ExpenseSchema = z.object({
  amount: z.number().positive(),
  description: z.string().min(1),
  categoryId: z.string().uuid(),
  date: z.string(),
});

export function ExpenseForm({ onSubmit }: { onSubmit: (data: any) => void }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(ExpenseSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        type="number"
        step="0.01"
        {...register('amount', { valueAsNumber: true })}
      />
      {errors.amount && <span>{errors.amount.message}</span>}

      <input
        type="text"
        {...register('description')}
      />
      {errors.description && <span>{errors.description.message}</span>}

      <button type="submit">提交</button>
    </form>
  );
}
```

### 2. 第三方集成

#### cURL 示例
```bash
# 注册
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"张三","email":"zhangsan@example.com","password":"password123"}'

# 登录并保存 Cookie
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"zhangsan@example.com","password":"password123"}' \
  -c cookies.txt

# 创建开支
curl -X POST http://localhost:3000/api/expenses \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"amount":100,"description":"午餐","categoryId":"...","date":"2026-01-07"}'

# 获取开支
curl http://localhost:3000/api/expenses -b cookies.txt
```

#### JavaScript SDK 示例
```javascript
// api-client.js
class ExpenseTrackerAPI {
  constructor(baseURL = 'http://localhost:3000/api') {
    this.baseURL = baseURL;
    this.cookies = '';
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
        ...(this.cookies && { Cookie: this.cookies }),
      },
    });

    // 保存 Set-Cookie
    const setCookie = response.headers.get('set-cookie');
    if (setCookie) {
      this.cookies = setCookie.split(';')[0];
    }

    return response.json();
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getExpenses(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/expenses?${query}`);
  }

  async createExpense(expenseData) {
    return this.request('/expenses', {
      method: 'POST',
      body: JSON.stringify(expenseData),
    });
  }
}

// 使用示例
const api = new ExpenseTrackerAPI();

await api.register({
  name: '张三',
  email: 'zhangsan@example.com',
  password: 'password123',
});

await api.login({
  email: 'zhangsan@example.com',
  password: 'password123',
});

await api.createExpense({
  amount: 150.50,
  description: '午餐费用',
  categoryId: '45594870-1737-4df1-b2ad-a6fe2f36492b',
  date: '2026-01-07',
});

const expenses = await api.getExpenses();
```

---

## 部署指南

### 开发环境
```bash
npm run dev          # 启动开发服务器 (http://localhost:3000)
npm run migrate      # 数据库迁移
npm run test:api     # API 测试
```

### 生产环境

#### 1. 构建
```bash
npm run build
```

#### 2. 启动
```bash
npm run start
```

#### 3. 环境变量
确保生产环境设置：
```bash
NODE_ENV=production
DATABASE_URL=postgresql://...
```

### Docker 部署

#### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
```

#### 构建和运行
```bash
docker build -t expense-tracker .
docker run -p 3000:3000 expense-tracker
```

---

## 故障排除

### 常见问题

#### 1. 数据库连接失败
**症状：** 错误信息 "Failed to connect to database"

**解决方案：**
- 检查 DATABASE_URL 是否正确
- 确认数据库服务是否运行
- 验证网络连接
- 检查 SSL 设置

```bash
# 测试连接
npm run migrate
```

#### 2. 认证失败
**症状：** 401 Unauthorized

**解决方案：**
- 确认用户已登录
- 检查 Cookie 是否正确设置
- 验证会话是否过期
- 清除浏览器缓存重新尝试

#### 3. API 返回 500 错误
**症状：** 服务器内部错误

**解决方案：**
- 查看服务器日志
- 检查数据库查询
- 验证输入数据格式
- 确认环境变量设置

```bash
# 查看日志
tail -f .next/trace
```

#### 4. 类型错误
**症状：** TypeScript 编译错误

**解决方案：**
- 运行类型检查
- 更新类型定义
- 检查数据模型一致性

```bash
npm run type-check
```

### 调试技巧

#### 1. 启用详细日志
```typescript
// next.config.js
module.exports = {
  experimental: {
    serverComponentsExternalPackages: ['@neondatabase/serverless'],
  },
};
```

#### 2. 数据库查询日志
```typescript
// lib/db/connection.ts
if (process.env.NODE_ENV === 'development') {
  console.log('Database query:', query);
}
```

#### 3. API 调试
```bash
# 使用 curl 详细模式
curl -v http://localhost:3000/api/expenses \
  -b cookies.txt
```

---

## 最佳实践

### 1. 代码组织
- **分层架构** - 清晰的分层（API → Service → DAO → DB）
- **单一职责** - 每个模块只负责一个功能
- **依赖注入** - 避免硬编码依赖
- **类型安全** - 完整的 TypeScript 类型定义

### 2. 错误处理
- **统一错误格式** - 始终返回 `{ success, error, details }`
- **具体错误信息** - 提供清晰的错误描述
- **优雅降级** - 错误不应导致系统崩溃
- **日志记录** - 记录错误以便调试

### 3. 安全实践
- **输入验证** - 客户端和服务端双重验证
- **SQL 注入防护** - 使用 ORM 参数化查询
- **密码哈希** - 绝不明文存储密码
- **会话安全** - 使用 httpOnly Cookie
- **HTTPS** - 生产环境强制使用

### 4. 性能优化
- **索引优化** - 为常用查询字段添加索引
- **分页** - 大量数据使用分页加载
- **缓存** - 适当使用缓存策略
- **代码分割** - Next.js 自动优化

### 5. 可维护性
- **文档** - 保持 API 文档更新
- **注释** - 复杂逻辑添加注释
- **测试** - 编写单元测试和集成测试
- **版本控制** - 遵循 Git 提交规范

---

## 常见用例

### 1. 新用户注册流程
```
1. 访问注册页
2. 填写表单
3. 提交注册
4. 自动登录
5. 重定向到主页
```

### 2. 添加开支流程
```
1. 用户登录
2. 点击"添加开支"
3. 填写表单
4. 选择分类
5. 提交
6. 实时更新列表
```

### 3. 查看开支统计
```
1. 登录后进入主页
2. 查看总开支
3. 查看本月开支
4. 浏览开支列表
5. 按分类筛选
```

---

## 扩展指南

### 1. 添加新字段
```typescript
// 1. 更新 Schema
export const expenses = pgTable('expenses', {
  // 现有字段...
  notes: text('notes'),          // 新字段
});

// 2. 更新类型
export type Expense = typeof expenses.$inferSelect & {
  notes?: string;
};

// 3. 更新验证
export const ExpenseSchema = z.object({
  // 现有验证...
  notes: z.string().optional(),
});

// 4. 更新 DAO
static async create(data: CreateExpenseInput) {
  return db.insert(expenses).values({
    // 现有字段...
    notes: data.notes,
  });
}
```

### 2. 添加新 API
```typescript
// 1. 创建路由
export async function GET(request: NextRequest) {
  // 实现逻辑
}

// 2. 添加 DAO 方法
static async findByDateRange(userId: string, start: Date, end: Date) {
  // 实现
}

// 3. 添加前端调用
const response = await fetch('/api/expenses/statistics');
```

### 3. 集成第三方服务
```typescript
// 发送邮件示例
import nodemailer from 'nodemailer';

export async function sendPasswordResetEmail(email: string, token: string) {
  const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: 'noreply@expensetracker.com',
    to: email,
    subject: '密码重置',
    html: `<p>点击链接重置密码: <a href="${process.env.APP_URL}/reset?token=${token}">重置</a></p>`,
  });
}
```

---

## 更新日志

### v1.0.0 (2026-01-07)
- ✅ 初始版本发布
- ✅ 完整的认证系统
- ✅ PostgreSQL 数据库集成
- ✅ 开支管理功能
- ✅ 分类系统
- ✅ API 文档
- ✅ 集成指南

---

## 技术支持

如需帮助，请参考：
- [API 文档](./API_DOCUMENTATION.md)
- [README](./README.md)
- [项目总结](./PROJECT_SUMMARY.md)

---

**文档版本：** v1.0.0
**最后更新：** 2026-01-07
