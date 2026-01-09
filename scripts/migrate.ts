/**
 * 数据库迁移脚本
 *
 * 此脚本用于初始化数据库表结构并同步预定义数据
 *
 * 使用方法：
 * 1. 设置环境变量 DATABASE_URL 或 NEON_DATABASE_URL
 * 2. 运行: npx tsx scripts/migrate.ts
 */

import { config } from 'dotenv';

async function main() {
  config();

  // Import database utilities after dotenv is loaded
  const { db, sql } = await import('@/lib/db/connection');
  const { CategoryDAO } = await import('@/lib/db/category-dao');

  // 确保数据库连接存在
  if (!db || !sql) {
    console.error('❌ 数据库连接失败，请检查 DATABASE_URL 环境变量');
    console.error('当前 DATABASE_URL:', process.env.DATABASE_URL ? '已设置' : '未设置');
    process.exit(1);
  }

  try {
    console.log('🚀 开始数据库迁移...\n');

    // 检查数据库连接
    await sql`SELECT 1`;
    console.log('✅ 数据库连接成功\n');

    // 创建表结构（如果不存在）
    console.log('📋 检查表结构...');

    // 用户表
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(100) NOT NULL,
        role VARCHAR(20) DEFAULT 'user' NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      )
    `;
    console.log('  ✅ users 表');

    // 分类表
    await sql`
      CREATE TABLE IF NOT EXISTS categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        name VARCHAR(50) NOT NULL,
        slug VARCHAR(50) NOT NULL,
        color VARCHAR(7) DEFAULT '#6366f1' NOT NULL,
        is_predefined BOOLEAN DEFAULT false NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        UNIQUE(user_id, slug)
      )
    `;
    console.log('  ✅ categories 表');

    // 开支表
    await sql`
      CREATE TABLE IF NOT EXISTS expenses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        category_id UUID NOT NULL,
        amount NUMERIC(10,2) NOT NULL,
        description TEXT NOT NULL,
        date TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      )
    `;
    console.log('  ✅ expenses 表');

    // 访问日志表
    await sql`
      CREATE TABLE IF NOT EXISTS access_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID,
        action VARCHAR(100) NOT NULL,
        resource VARCHAR(100) NOT NULL,
        resource_id VARCHAR(100) NOT NULL,
        ip_address VARCHAR(45),
        user_agent TEXT,
        success BOOLEAN DEFAULT true NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
      )
    `;
    console.log('  ✅ access_logs 表\n');

    // 创建索引
    console.log('📊 创建索引...');

    // 用户表索引
    await sql`CREATE INDEX IF NOT EXISTS idx_users_created_at ON users (created_at)`;
    await sql`CREATE UNIQUE INDEX IF NOT EXISTS uniq_users_email ON users (email)`;
    console.log('  ✅ users 索引');

    // 分类表索引
    await sql`CREATE INDEX IF NOT EXISTS idx_categories_user ON categories (user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_categories_predefined ON categories (is_predefined)`;
    await sql`CREATE UNIQUE INDEX IF NOT EXISTS uniq_categories_user_slug ON categories (user_id, slug)`;
    console.log('  ✅ categories 索引');

    // 开支表索引
    await sql`CREATE INDEX IF NOT EXISTS idx_expenses_user ON expenses (user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses (category_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses (date)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON expenses (user_id, date)`;
    console.log('  ✅ expenses 索引');

    // 访问日志表索引
    await sql`CREATE INDEX IF NOT EXISTS idx_access_logs_user ON access_logs (user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_access_logs_action ON access_logs (action)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_access_logs_created_at ON access_logs (created_at)`;
    console.log('  ✅ access_logs 索引\n');

    // 同步预定义分类
    console.log('📂 同步预定义分类...');
    await CategoryDAO.syncPredefinedCategories();
    console.log('  ✅ 预定义分类同步完成\n');

    console.log('🎉 数据库迁移完成！\n');

    console.log('📝 下一步操作：');
    console.log('1. 配置环境变量 DATABASE_URL 或 NEON_DATABASE_URL');
    console.log('2. 启动开发服务器: npm run dev');
    console.log('3. 访问 http://localhost:3000 查看应用\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ 迁移失败:', error);
    process.exit(1);
  }
}

// 运行迁移
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
