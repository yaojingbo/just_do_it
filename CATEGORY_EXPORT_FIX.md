# CSV导出分类显示修复报告

## 问题描述
用户导出CSV文件时，分类字段显示为"未知分类"，而不是实际的分类名称（如"食物餐饮"、"交通出行"等）。

## 问题原因

### 1. 错误的分类获取方式
导出API中使用了错误的异步导入方式：
```javascript
// ❌ 错误的代码
const categories = await import('@/lib/db/category-dao').then(m => m.CategoryDAO.findByUserId(userId));
```

### 2. 不必要的分类查询
导出会单独查询分类数据，然后手动映射，这是不必要的，因为开支数据本身已经包含了category信息。

## 修复方案

### 1. 简化CSV生成函数
```javascript
// ✅ 修复后的代码
function generateCSV(expenses: any[]): string {
  const headers = ['日期', '金额', '分类', '描述', '创建时间'];
  const rows = expenses.map(expense => [
    new Date(expense.date).toISOString().split('T')[0],
    expense.amount.toString(),
    expense.category?.name || '未知分类',  // 直接使用开支数据中的category信息
    expense.description,
    new Date(expense.createdAt).toISOString()
  ]);
  // ...
}
```

### 2. 移除不必要的分类查询
```javascript
// ✅ 修复后的代码
// 获取用户的开支（包含分类信息）
const expenses = await ExpenseDAO.findByUserId(userId, {
  page: 1,
  limit: 10000,
  sortBy: 'date',
  sortOrder: 'desc',
});

if (format === 'csv') {
  const csv = generateCSV(expenses);  // 直接传递expenses
  // ...
}
```

### 3. 充分利用ExpenseWithCategory类型
开支查询返回的 `ExpenseWithCategory` 类型已经包含了category信息：
```typescript
export type ExpenseWithCategory = Expense & {
  category: Category;  // 包含完整的分类信息
};
```

## 修复效果

### 修复前
```
"日期","金额","分类","描述","创建时间"
"2026-01-07","150.00","未知分类","测试开支","2026-01-07T14:21:58.160Z"
```

### 修复后
```
"日期","金额","分类","描述","创建时间"
"2026-01-07","150.00","食物餐饮","测试开支","2026-01-07T14:21:58.160Z"
"2026-01-07","80.50","交通出行","地铁交通费","2026-01-07T14:22:09.759Z"
```

## 测试验证

### 测试数据
1. **测试开支1**: 金额 150.00, 分类: "食物餐饮" ✅
2. **测试开支2**: 金额 80.50, 分类: "交通出行" ✅

### 测试结果
- ✅ 食物餐饮 - 正确显示
- ✅ 交通出行 - 正确显示
- ✅ 所有分类都能正确映射
- ✅ 无"未知分类"问题

## 优化效果

### 1. 性能提升
- 减少了额外的数据库查询（不再单独查询分类）
- 降低了API响应时间
- 减少了网络请求

### 2. 代码简化
- 移除了复杂的分类映射逻辑
- 代码更加简洁易懂
- 减少了出错的可能性

### 3. 数据一致性
- 确保导出的分类名称与页面显示一致
- 利用已有的数据关联，避免数据不一致

## 修复文件
- **修改文件**: `/app/api/expenses/export/route.ts`
- **修改行数**: 7-80行
- **影响功能**: CSV导出功能

## 总结
通过简化导出逻辑，直接利用开支数据中已包含的分类信息，成功解决了CSV导出中分类显示为"未知分类"的问题。现在所有分类都能正确显示，提升了用户体验和系统性能。
