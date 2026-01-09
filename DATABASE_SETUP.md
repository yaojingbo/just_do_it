# 数据库设置指南

## 🚀 快速开始

### 1. 创建 Neon 数据库账户

1. 访问 [Neon.tech](https://neon.tech)
2. 注册账户并登录
3. 创建新项目：
   - 选择区域（推荐：us-east-1 或离您最近的区域）
   - 为数据库命名（例如：expense-tracker）
4. 复制数据库 URL

### 2. 配置环境变量

编辑 `.env` 文件，替换为您的实际数据库 URL：

```bash
# 替换为您的实际数据库 URL
DATABASE_URL="postgresql://username:password@ep-xxx-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

**注意：**
- `username` 和 `password` 是您的数据库凭据
- `ep-xxx-xxx-xxx` 是您的端点ID
- `us-east-1` 是您的区域
- `neondb` 是您的数据库名

### 3. 运行数据库迁移

```bash
npm run migrate
```

迁移脚本将：
- ✅ 创建所有必要的表（users, categories, expenses, access_logs）
- ✅ 创建索引以优化查询性能
- ✅ 同步预定义分类数据
- ✅ 验证数据库连接

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 查看应用

---

## 📋 数据库表结构

### users 表
存储用户信息（认证、用户管理）

### categories 表
存储开支分类（支持预定义和用户自定义分类）

### expenses 表
存储开支记录（金额、描述、日期、分类关联）

### access_logs 表
记录所有API访问（C4约束：审计跟踪）

---

## 🔧 故障排除

### 问题：迁移脚本失败
**解决方案：**
1. 检查数据库URL是否正确
2. 确认数据库项目处于活动状态
3. 检查用户名和密码是否正确
4. 确保数据库URL使用 `sslmode=require`

### 问题：无法连接到数据库
**解决方案：**
1. 检查网络连接
2. 验证防火墙设置
3. 确认数据库项目在 Neon 控制台中为 "Active" 状态

### 问题：权限被拒绝
**解决方案：**
1. 检查用户权限
2. 确认数据库URL中的用户名和密码正确

---

## 📊 监控和维护

### 查看数据库活动
在 Neon 控制台中：
- 查看数据库使用情况
- 监控连接数
- 检查存储使用量
- 查看查询性能

### 备份策略
- Neon 自动进行每日备份
- 可以手动创建恢复点
- 支持时间点恢复

### 性能优化
- 迁移脚本自动创建索引
- 定期查看慢查询
- 监控数据库连接池

---

## 🧪 测试数据库

### 连接测试
```bash
node -e "require('dotenv').config(); const { checkDatabaseConnection } = require('./lib/db/connection.ts'); checkDatabaseConnection().then(console.log);"
```

### 查询测试
```bash
curl http://localhost:3000/api/categories
curl http://localhost:3000/api/expenses
```

---

## 📝 下一步

数据库设置完成后，您可以：

1. ✅ 测试API路由
2. ✅ 验证CRUD操作
3. ✅ 测试前端功能
4. ✅ 配置用户认证
5. ✅ 部署到生产环境

---

## 💡 提示

- **开发环境：** 使用 Neon's 免费套餐
- **生产环境：** 考虑升级到付费计划
- **监控：** 定期检查 Neon 控制台
- **安全：** 永不在代码中硬编码凭据
- **备份：** 重要数据定期导出备份

---

**需要帮助？**
- [Neon 文档](https://neon.tech/docs)
- [Drizzle ORM 文档](https://orm.drizzle.team/docs)
- [Next.js 数据库集成](https://nextjs.org/docs/app/building-your-application/data)
