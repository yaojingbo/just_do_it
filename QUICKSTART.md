# 快速开始指南

## 🚀 5分钟快速部署

### 第一步：配置数据库

1. 创建 [Neon](https://neon.tech) 免费账户
2. 创建新项目并复制数据库 URL
3. 编辑 `.env` 文件：

```bash
DATABASE_URL="您的真实数据库URL"
```

### 第二步：安装依赖

```bash
npm install
```

### 第三步：初始化数据库

```bash
npm run migrate
```

### 第四步：启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

---

## 🧪 测试

### 测试API

```bash
npm run test:api
```

### 测试构建

```bash
npm run build
```

### 类型检查

```bash
npm run type-check
```

---

## 📝 常用命令

```bash
# 开发服务器
npm run dev

# 生产构建
npm run build
npm start

# 数据库操作
npm run migrate        # 运行迁移
npm run db:reset       # 重置数据库

# 测试
npm run test:api       # 测试API
npm run lint           # 代码检查
```

---

## 📋 项目结构

```
task002/
├── app/                   # Next.js 应用
│   ├── api/              # API 路由
│   │   ├── expenses/     # 开支 API
│   │   └── categories/   # 分类 API
│   └── page.tsx         # 首页
├── lib/                  # 核心库
│   ├── db/              # 数据库层
│   │   ├── schema.ts    # Drizzle Schema
│   │   ├── dao/         # 数据访问对象
│   │   └── connection.ts # 数据库连接
│   └── services/        # 业务逻辑
├── store/               # Zustand 状态管理
├── scripts/             # 脚本
│   └── migrate.ts       # 数据库迁移
├── .env                 # 环境变量
├── .env.example         # 环境变量模板
└── DATABASE_SETUP.md    # 详细数据库设置
```

---

## 🔧 功能状态

| 功能 | 状态 | 说明 |
|------|------|------|
| 数据库集成 | ✅ | PostgreSQL + Drizzle ORM |
| API 路由 | ✅ | RESTful API |
| 状态管理 | ✅ | Zustand Store |
| 数据验证 | ✅ | Zod 验证 |
| 安全实现 | ✅ | 密码加密、访问控制 |
| 访问日志 | ✅ | C4 约束 |
| 构建验证 | ✅ | 生产就绪 |

---

## 🎯 下一步

1. ✅ 环境配置
2. ✅ API 测试
3. ✅ Store 集成
4. 🔄 配置真实数据库
5. ⏳ 用户认证系统
6. ⏳ UI/UX 优化
7. ⏳ 错误边界
8. ⏳ 部署配置

---

## 📚 文档

- [数据库设置指南](./DATABASE_SETUP.md) - 详细的数据库配置
- [版本管理](./VERSION_MANAGEMENT.md) - 项目版本历史
- [项目总结](./PROJECT_SUMMARY.md) - 完整技术文档

---

## 💡 提示

- 需要帮助？请查看 [DATABASE_SETUP.md](./DATABASE_SETUP.md)
- 遇到问题？检查控制台日志
- 建议：使用 Neon 免费套餐进行开发

---

**快速开始只需 5 分钟！** ⚡
