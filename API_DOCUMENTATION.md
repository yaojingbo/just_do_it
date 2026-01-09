# API 文档

## 项目概述

本文档描述了家庭开销记录器的 RESTful API 接口。API 基于 Next.js 构建，使用 PostgreSQL 数据库和 Drizzle ORM 进行数据持久化。

## 基础信息

- **基础 URL：** `http://localhost:3000/api`
- **API 版本：** v1.0
- **认证方式：** Session Cookie (httpOnly)
- **内容类型：** `application/json`
- **字符编码：** UTF-8

## 认证机制

API 使用基于会话的认证机制。用户登录后，服务器会在响应中设置 `session_token` Cookie（httpOnly）。后续请求需要携带此 Cookie 进行身份验证。

### Cookie 属性
```http
Set-Cookie: session_token=<token>; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800
```

## 通用响应格式

### 成功响应
```json
{
  "success": true,
  "data": {
    // 实际数据
  },
  "message": "操作成功"
}
```

### 错误响应
```json
{
  "success": false,
  "error": "错误消息",
  "details": {
    // 详细错误信息（可选）
  }
}
```

### 分页响应
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## 状态码说明

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未授权（未登录或会话过期） |
| 403 | 禁止访问（权限不足） |
| 404 | 资源不存在 |
| 422 | 数据验证失败 |
| 500 | 服务器内部错误 |

---

## 认证接口

### 1. 用户注册

**接口：** `POST /api/auth/register`

**功能：** 创建新用户账户

**请求体：**
```json
{
  "name": "用户名",
  "email": "user@example.com",
  "password": "password123"
}
```

**参数说明：**
- `name` (string, 必需) - 用户姓名，1-100 字符
- `email` (string, 必需) - 邮箱地址，必须是有效邮箱格式
- `password` (string, 必需) - 密码，至少8个字符

**响应示例：**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "2823788c-c99e-4d98-b1cc-368727de2843",
      "email": "user@example.com",
      "name": "用户名",
      "role": "user"
    },
    "session": {
      "userId": "2823788c-c99e-4d98-b1cc-368727de2843",
      "email": "user@example.com",
      "name": "用户名",
      "role": "user",
      "createdAt": "2026-01-07T12:56:09.972Z"
    }
  },
  "message": "注册成功"
}
```

**可能错误：**
- 400 - 密码太短
- 422 - 邮箱格式不正确
- 422 - 用户名长度不符合要求
- 409 - 邮箱已被注册

---

### 2. 用户登录

**接口：** `POST /api/auth/login`

**功能：** 用户身份验证并创建会话

**请求体：**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**参数说明：**
- `email` (string, 必需) - 注册邮箱
- `password` (string, 必需) - 密码

**响应示例：**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "2823788c-c99e-4d98-b1cc-368727de2843",
      "email": "user@example.com",
      "name": "用户名",
      "role": "user"
    },
    "session": {
      "userId": "2823788c-c99e-4d98-b1cc-368727de2843",
      "email": "user@example.com",
      "name": "用户名",
      "role": "user",
      "createdAt": "2026-01-07T12:56:13.549Z"
    }
  },
  "message": "登录成功"
}
```

**可能错误：**
- 401 - 邮箱或密码错误
- 422 - 邮箱格式不正确
- 422 - 密码不能为空

**Cookie 设置：**
成功后设置 `session_token` Cookie，用于后续请求的身份验证。

---

### 3. 用户登出

**接口：** `POST /api/auth/logout`

**功能：** 清除用户会话

**请求头：**
```
Cookie: session_token=<token>
```

**响应示例：**
```json
{
  "success": true,
  "message": "登出成功"
}
```

**可能错误：**
- 401 - 未登录或会话已过期

**Cookie 清除：**
成功后清除 `session_token` Cookie。

---

### 4. 会话查询

**接口：** `GET /api/auth/session`

**功能：** 获取当前用户会话信息

**请求头：**
```
Cookie: session_token=<token>
```

**响应示例：**
```json
{
  "success": true,
  "data": {
    "userId": "2823788c-c99e-4d98-b1cc-368727de2843",
    "email": "user@example.com",
    "name": "用户名",
    "role": "user",
    "createdAt": "2026-01-07T12:56:13.549Z"
  }
}
```

**可能错误：**
- 401 - 未登录或会话已过期

---

## 开支接口

### 1. 获取开支列表

**接口：** `GET /api/expenses`

**功能：** 获取当前用户的开支记录列表

**请求头：**
```
Cookie: session_token=<token>
```

**查询参数（可选）：**
- `page` (number) - 页码，默认1
- `limit` (number) - 每页数量，默认20，最大100
- `categoryId` (string) - 分类ID筛选
- `dateFrom` (string) - 开始日期 (YYYY-MM-DD)
- `dateTo` (string) - 结束日期 (YYYY-MM-DD)

**响应示例：**
```json
{
  "success": true,
  "data": [
    {
      "id": "1dabcb1d-4386-4f37-85a5-d6789deab689",
      "userId": "2823788c-c99e-4d98-b1cc-368727de2843",
      "amount": "100.00",
      "categoryId": "45594870-1737-4df1-b2ad-a6fe2f36492b",
      "description": "测试开支",
      "date": "2026-01-07T00:00:00.000Z",
      "createdAt": "2026-01-07T12:56:33.523Z",
      "updatedAt": "2026-01-07T12:56:33.523Z",
      "category": {
        "id": "45594870-1737-4df1-b2ad-a6fe2f36492b",
        "name": "食物餐饮",
        "color": "#ef4444",
        "isPredefined": true
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

**可能错误：**
- 401 - 未登录或会话已过期
- 422 - 查询参数格式错误

---

### 2. 创建开支

**接口：** `POST /api/expenses`

**功能：** 创建新的开支记录

**请求头：**
```
Content-Type: application/json
Cookie: session_token=<token>
```

**请求体：**
```json
{
  "amount": 100,
  "description": "开支描述",
  "categoryId": "45594870-1737-4df1-b2ad-a6fe2f36492b",
  "date": "2026-01-07"
}
```

**参数说明：**
- `amount` (number, 必需) - 开支金额，必须是正数，最多两位小数
- `description` (string, 必需) - 开支描述，1-500 字符
- `categoryId` (string, 必需) - 分类ID，必须是有效的UUID
- `date` (string, 必需) - 开支日期，YYYY-MM-DD 格式

**响应示例：**
```json
{
  "success": true,
  "data": {
    "id": "1dabcb1d-4386-4f37-85a5-d6789deab689",
    "userId": "2823788c-c99e-4d98-b1cc-368727de2843",
    "amount": "100.00",
    "categoryId": "45594870-1737-4df1-b2ad-a6fe2f36492b",
    "description": "开支描述",
    "date": "2026-01-07T00:00:00.000Z",
    "createdAt": "2026-01-07T12:56:33.523Z",
    "updatedAt": "2026-01-07T12:56:33.523Z"
  },
  "message": "开支创建成功"
}
```

**可能错误：**
- 401 - 未登录或会话已过期
- 422 - 数据验证失败（格式错误）
- 422 - 无效的分类ID

---

## 分类接口

### 1. 获取分类列表

**接口：** `GET /api/categories`

**功能：** 获取当前用户的分类列表（包含预定义分类）

**请求头：**
```
Cookie: session_token=<token>
```

**响应示例：**
```json
{
  "success": true,
  "data": [
    {
      "id": "45594870-1737-4df1-b2ad-a6fe2f36492b",
      "userId": "00000000-0000-0000-0000-000000000000",
      "name": "食物餐饮",
      "slug": "food",
      "color": "#ef4444",
      "isPredefined": true,
      "createdAt": "2026-01-07T09:15:09.861Z",
      "updatedAt": "2026-01-07T09:15:09.861Z"
    },
    {
      "id": "0388b3ad-b12f-4e50-b6ca-cfc3015bdd05",
      "userId": "00000000-0000-0000-0000-000000000000",
      "name": "交通出行",
      "slug": "transport",
      "color": "#3b82f6",
      "isPredefined": true,
      "createdAt": "2026-01-07T09:15:09.954Z",
      "updatedAt": "2026-01-07T09:15:09.954Z"
    }
    // ... 更多分类
  ]
}
```

**可能错误：**
- 401 - 未登录或会话已过期

---

## 数据模型

### 用户 (User)
```typescript
{
  id: string;                    // UUID
  email: string;                 // 邮箱
  name: string;                  // 姓名
  role: 'user' | 'admin';       // 角色
  createdAt: string;             // 创建时间 (ISO 8601)
  updatedAt: string;             // 更新时间 (ISO 8601)
}
```

### 会话 (Session)
```typescript
{
  userId: string;               // 用户ID (UUID)
  email: string;                // 邮箱
  name: string;                 // 姓名
  role: string;                 // 角色
  createdAt: string;            // 创建时间 (ISO 8601)
}
```

### 分类 (Category)
```typescript
{
  id: string;                   // UUID
  userId: string;               // 用户ID (UUID)
  name: string;                  // 分类名称
  slug: string;                 // 分类标识符
  color: string;                 // 颜色代码 (#RRGGBB)
  isPredefined: boolean;         // 是否为预定义分类
  createdAt: string;            // 创建时间 (ISO 8601)
  updatedAt: string;            // 更新时间 (ISO 8601)
}
```

### 开支 (Expense)
```typescript
{
  id: string;                   // UUID
  userId: string;               // 用户ID (UUID)
  categoryId: string;            // 分类ID (UUID)
  amount: string;                // 金额 (字符串形式的数字)
  description: string;           // 描述
  date: string;                 // 开支日期 (ISO 8601)
  createdAt: string;            // 创建时间 (ISO 8601)
  updatedAt: string;            // 更新时间 (ISO 8601)
  category?: {                   // 关联的分类信息（查询时包含）
    id: string;
    name: string;
    color: string;
    isPredefined: boolean;
  }
}
```

---

## 错误代码

| 错误代码 | HTTP状态码 | 说明 |
|----------|------------|------|
| INVALID_EMAIL | 422 | 邮箱格式不正确 |
| WEAK_PASSWORD | 422 | 密码强度不足 |
| EMAIL_EXISTS | 409 | 邮箱已被注册 |
| INVALID_CREDENTIALS | 401 | 邮箱或密码错误 |
| UNAUTHORIZED | 401 | 未授权（未登录或会话过期） |
| INVALID_UUID | 422 | UUID格式不正确 |
| INVALID_AMOUNT | 422 | 金额格式不正确 |
| CATEGORY_NOT_FOUND | 404 | 分类不存在 |
| VALIDATION_ERROR | 422 | 数据验证失败 |
| INTERNAL_ERROR | 500 | 服务器内部错误 |

---

## 示例请求

### cURL 示例

#### 1. 用户注册
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "张三",
    "email": "zhangsan@example.com",
    "password": "password123"
  }'
```

#### 2. 用户登录
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "zhangsan@example.com",
    "password": "password123"
  }' \
  -c cookies.txt
```

#### 3. 获取开支列表
```bash
curl http://localhost:3000/api/expenses \
  -b cookies.txt
```

#### 4. 创建开支
```bash
curl -X POST http://localhost:3000/api/expenses \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "amount": 150.50,
    "description": "午餐费用",
    "categoryId": "45594870-1737-4df1-b2ad-a6fe2f36492b",
    "date": "2026-01-07"
  }'
```

#### 5. 获取分类列表
```bash
curl http://localhost:3000/api/categories \
  -b cookies.txt
```

#### 6. 用户登出
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -b cookies.txt
```

---

## 最佳实践

### 1. 错误处理
- 始终检查响应的 `success` 字段
- 对 HTTP 状态码 401 进行特殊处理（重定向到登录页）
- 显示用户友好的错误消息

### 2. 认证
- 登录成功后保存 Cookie
- 每次请求自动携带 Cookie
- 定期检查会话有效性

### 3. 数据验证
- 客户端进行初步验证
- 服务端进行严格验证
- 显示详细的验证错误信息

### 4. 性能优化
- 使用分页减少数据传输
- 仅查询需要的字段
- 合理使用查询参数筛选

---

## 更新日志

### v1.0.0 (2026-01-07)
- ✅ 初始版本发布
- ✅ 用户认证接口
- ✅ 开支 CRUD 接口
- ✅ 分类查询接口
- ✅ 基于会话的认证机制
- ✅ 完整的数据验证

---

## 技术支持

如有问题或建议，请查阅项目文档或联系开发团队。

---

**文档版本：** v1.0.0
**最后更新：** 2026-01-07
