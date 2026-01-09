# 数据库架构文档 - 家庭开销记录器

## 概述

本文档描述了家庭开销记录器项目的数据库架构，基于PostgreSQL（Neon托管）使用Drizzle ORM实现。

## 项目特点

- **简单实用**：仅包含3个核心表（users, categories, expenses）
- **用户隔离**：每个用户的数据完全隔离
- **预定义分类**：系统内置8个常用分类
- **数据完整**：所有金额使用DECIMAL类型保证精度

## 架构设计

### 技术栈

- **数据库**: PostgreSQL (Neon托管)
- **ORM**: Drizzle ORM
- **类型系统**: TypeScript + Drizzle类型推断
- **验证**: Zod
- **迁移**: Drizzle Kit

### 核心表结构

#### 1. users - 用户表

存储用户基本信息。

```sql
- id: UUID (主键)
- email: VARCHAR(255) (唯一)
- name: VARCHAR(100)
- password: VARCHAR(255) (加密存储)
- role: VARCHAR(20) (user/admin)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

**索引**:
- `idx_users_email` (唯一索引)
- `idx_users_role`

#### 2. categories - 分类表

存储开支分类，支持预定义和自定义分类。

```sql
- id: UUID (主键)
- user_id: UUID (外键 → users.id, 可空)
- name: VARCHAR(50) (分类名称)
- slug: VARCHAR(50) (URL友好标识)
- color: VARCHAR(7) (颜色代码)
- is_predefined: BOOLEAN (是否为预定义分类)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

**索引**:
- `idx_categories_user` (用户分类索引)
- `idx_categories_slug` (唯一索引)
- `idx_categories_predefined` (预定义分类索引)

**说明**:
- 预定义分类：`user_id = NULL`, `is_predefined = true`
- 用户自定义分类：`user_id = 用户ID`, `is_predefined = false`

#### 3. expenses - 开支表

存储所有开支记录。

```sql
- id: UUID (主键)
- user_id: UUID (外键 → users.id)
- amount: DECIMAL(10,2) (金额)
- category_id: UUID (外键 → categories.id)
- description: VARCHAR(500) (描述)
- date: TIMESTAMP (开支日期)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

**索引**:
- `idx_expenses_user` (用户开支索引)
- `idx_expenses_category` (分类索引)
- `idx_expenses_date` (日期索引)
- `idx_expenses_user_date` (复合索引: 用户+日期)

## 关系图

```
users (1) ----< (N) categories (1) ----< (N) expenses
  |                     |                     |
  |                     |                     |
  |                     |                     |
  +--- 自定义分类        +--- 预定义分类        +--- 开支记录
```

## 预定义分类

系统内置8个常用分类：

1. **食物餐饮** (`food`) - #ef4444
2. **交通出行** (`transport`) - #3b82f6
3. **住房水电** (`housing`) - #10b981
4. **服装购物** (`shopping`) - #f59e0b
5. **娱乐休闲** (`entertainment`) - #8b5cf6
6. **医疗健康** (`healthcare`) - #ec4899
7. **学习教育** (`education`) - #06b6d4
8. **其他杂项** (`others`) - #6b7280

## 核心功能

### 1. 开支管理

- **创建开支**: `ExpenseDAO.create(userId, input)`
- **查询开支**: `ExpenseDAO.findByUserId(userId, query)`
- **更新开支**: `ExpenseDAO.update(id, userId, input)`
- **删除开支**: `ExpenseDAO.delete(id, userId)`

### 2. 统计分析

- **基础统计**: `ExpenseDAO.getStatistics(userId)`
- **分类统计**: `ExpenseDAO.getCategoryStatistics(userId)`
- **月度统计**: `ExpenseDAO.getMonthlyStatistics(userId, year)`

### 3. 数据验证

- **开支验证**: `createExpenseSchema`, `updateExpenseSchema`
- **分类验证**: `createCategorySchema`, `updateCategorySchema`
- **用户验证**: `createUserSchema`, `loginSchema`

## 使用指南

### 1. 环境配置

```bash
# 设置环境变量
DATABASE_URL=your_database_url
# 或
NEON_DATABASE_URL=your_project_id
NEON_API_KEY=your_api_key
```

### 2. 数据库迁移

```bash
# 生成迁移
npx drizzle-kit generate

# 应用迁移
npx drizzle-kit migrate

# 查看数据库状态
npx drizzle-kit studio
```

### 3. 查询示例

```typescript
import { ExpenseDAO } from '@/lib/db/expense-dao';

// 获取用户的开支列表
const expenses = await ExpenseDAO.findByUserId(userId, {
  page: 1,
  limit: 20,
  sortBy: 'date',
  sortOrder: 'desc',
});

// 获取分类统计
const stats = await ExpenseDAO.getCategoryStatistics(userId);
```

## 安全措施

### 数据隔离

- 每个用户只能访问自己的开支记录
- 外键约束确保数据完整性
- 行级安全策略（RLS）推荐

### 数据验证

- 所有输入使用Zod验证
- 金额使用DECIMAL类型避免精度问题
- 时间戳使用TIMESTAMP WITH TIMEZONE

### 性能优化

- 所有外键字段都有索引
- 常用查询字段建立索引
- 复合索引优化多条件查询

## 扩展规划

### 短期优化

- [ ] 添加开支标签功能
- [ ] 支持开支附件
- [ ] 添加数据导出功能

### 长期规划

- [ ] 多用户团队支持
- [ ] 数据可视化图表
- [ ] 预算管理功能

## 故障排除

### 常见问题

1. **连接失败**
   - 检查环境变量配置
   - 验证Neon数据库状态
   - 确认网络连接

2. **查询慢**
   - 检查索引使用情况
   - 优化查询条件
   - 分析执行计划

### 联系方式

- **技术负责人**: 家庭开销记录器团队
- **文档更新**: 2026-01-06
- **版本**: v1.0.0
