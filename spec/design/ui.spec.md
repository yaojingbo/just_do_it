# UI 设计规范文档 - 家庭开销记录器

## 1. 智能分析

### 1.1 应用程序类型判断

**类型：** MPA (多页面应用)

**判断依据：**
- **核心交互：** 离散的任务操作（记录开支、查看统计、管理分类）
- **用户任务：** 独立的功能模块（每个页面有明确的单一职责）
- **产品特性：** 工具类应用，用户在模块间切换而非持续交互

**结论：** 使用 MPA 结构，每个页面独立且功能完整。

### 1.2 导航结构

**类型：** 顶部导航 + 侧边栏

**设计决策：**
- 顶部导航：显示应用名称、用户信息、添加按钮
- 侧边栏：主要功能导航（开支列表、统计图表、分类管理）

**导航项目：**
```
顶部导航:
├─ 家庭开销记录器 (Logo + 标题)
├─ [添加开支按钮]
└─ [用户菜单]

侧边栏:
├─ 开支列表 (默认页面)
├─ 统计图表
├─ 分类管理
├─ 数据导出
└─ 设置
```

### 1.3 色彩方案 (OKLCH)

**主色调：** 180-240° (Blue/Green) - 蓝绿色

**具体色彩：**
```css
/* 主色调 - 蓝绿色 */
--color-primary: oklch(0.7 0.15 180);  /* 主要按钮和链接 */
--color-primary-foreground: oklch(0.98 0.02 180);  /* 主要文本 */

/* 辅助色 - 绿色 */
--color-success: oklch(0.7 0.15 150);  /* 成功状态 */
--color-warning: oklch(0.75 0.15 90);   /* 警告状态 */
--color-error: oklch(0.65 0.15 20);    /* 错误状态 */

/* 中性色 */
--color-background: oklch(0.98 0.02 240);  /* 背景色 */
--color-surface: oklch(0.95 0.02 240);   /* 表面色 */
--color-border: oklch(0.85 0.03 240);    /* 边框色 */
--color-text: oklch(0.15 0.02 240);      /* 文本色 */
```

**情感传达：** 专业、高效、可信赖的财务管理工具形象。

## 2. 设计系统

### 2.1 设计令牌 (Design Tokens)

```css
@theme inline {
  /* 间距系统 */
  --spacing-1: 0.25rem;   /* 4px */
  --spacing-2: 0.5rem;    /* 8px */
  --spacing-3: 0.75rem;   /* 12px */
  --spacing-4: 1rem;      /* 16px */
  --spacing-6: 1.5rem;    /* 24px */
  --spacing-8: 2rem;      /* 32px */
  --spacing-12: 3rem;     /* 48px */

  /* 圆角 */
  --radius-sm: 0.25rem;   /* 4px */
  --radius-md: 0.5rem;    /* 8px */
  --radius-lg: 0.75rem;   /* 12px */
  --radius-xl: 1rem;      /* 16px */

  /* 阴影 */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.07);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);

  /* 字体大小 */
  --font-xs: 0.75rem;     /* 12px */
  --font-sm: 0.875rem;    /* 14px */
  --font-base: 1rem;      /* 16px */
  --font-lg: 1.125rem;    /* 18px */
  --font-xl: 1.25rem;     /* 20px */
  --font-2xl: 1.5rem;    /* 24px */
  --font-3xl: 1.875rem;  /* 30px */
}
```

### 2.2 系统字体栈

```css
--font-sans: ui-sans-serif, system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", "Helvetica Neue", Arial, sans-serif;
```

**字体层级：**
- H1: font-3xl, font-bold
- H2: font-2xl, font-semibold
- H3: font-xl, font-semibold
- Body: font-base, font-normal
- Small: font-sm, font-normal
- Caption: font-xs, font-normal

## 3. 页面布局

### 3.1 响应式断点

| 名称 | 宽度 | 布局结构 |
|------|------|----------|
| 移动端 | <640px | 单列布局，底部导航，无侧边栏 |
| 平板 | 640-1024px | 可折叠侧边栏，紧凑布局 |
| 桌面端 | >1024px | 完整侧边栏，宽松布局 |

### 3.2 整体布局

```
┌─────────────────────────────────────────┐
│              顶部导航栏                   │
├──────────────┬──────────────────────────┤
│              │                          │
│   侧边栏     │        主内容区           │
│   (可折叠)   │                          │
│              │                          │
│              │                          │
│              │                          │
└──────────────┴──────────────────────────┘
```

### 3.3 页面结构

**开支列表页 (默认页)：**
```
┌─────────────────────────────────────────┐
│              顶部导航栏                   │
├──────────────┬──────────────────────────┤
│              │ 筛选器栏                 │
│   侧边栏     ├──────────────────────────┤
│              │                          │
│  • 开支列表   │    开支持续列表           │
│  • 统计图表   │   (卡片列表形式)          │
│  • 分类管理   │                          │
│  • 数据导出   │                          │
│  • 设置       │                          │
└──────────────┴──────────────────────────┘
```

**统计图表页：**
```
┌─────────────────────────────────────────┐
│              顶部导航栏                   │
├──────────────┬──────────────────────────┤
│              │ 图表控制栏               │
│   侧边栏     ├──────────────────────────┤
│              │                          │
│  • 开支列表   │     饼图 + 柱状图         │
│  • 统计图表   │                          │
│  • 分类管理   │                          │
│  • 数据导出   │                          │
│  • 设置       │                          │
└──────────────┴──────────────────────────┘
```

## 4. 组件规范

### 4.1 基础组件 (使用 shadcn/ui)

**按钮组件：**
```typescript
// 主要按钮 - 添加开支
<Button variant="default" size="lg">
  <PlusIcon className="mr-2 h-4 w-4" />
  添加开支
</Button>

// 次要按钮 - 编辑、删除
<Button variant="secondary" size="sm">
  编辑
</Button>

<Button variant="destructive" size="sm">
  删除
</Button>

// 文字按钮 - 筛选
<Button variant="ghost" size="sm">
  按分类筛选
</Button>
```

**输入组件：**
```typescript
// 金额输入
<Input
  type="number"
  placeholder="输入金额"
  className="font-mono"
/>

// 描述输入
<Textarea
  placeholder="添加备注（可选）"
  className="min-h-[80px]"
/>

// 分类选择
<Select>
  <SelectTrigger>
    <SelectValue placeholder="选择分类" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="food">🍽️ 食物餐饮</SelectItem>
    <SelectItem value="transport">🚗 交通出行</SelectItem>
  </SelectContent>
</Select>
```

**卡片组件：**
```typescript
// 开支持续卡片
<Card className="hover:shadow-md transition-shadow">
  <CardHeader>
    <div className="flex justify-between items-start">
      <div>
        <CardTitle className="text-lg">¥150.00</CardTitle>
        <CardDescription>超市购物</CardDescription>
      </div>
      <Badge variant="secondary">食物餐饮</Badge>
    </div>
  </CardHeader>
  <CardFooter className="text-sm text-muted-foreground">
    2024-12-01
    <Button variant="ghost" size="sm" className="ml-auto">
      编辑
    </Button>
  </CardFooter>
</Card>
```

**对话框组件：**
```typescript
// 添加开支对话框
<Dialog>
  <DialogTrigger asChild>
    <Button>添加开支</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>添加新开支</DialogTitle>
      <DialogDescription>
        记录一笔新的开支
      </DialogDescription>
    </DialogHeader>
    {/* 表单内容 */}
    <DialogFooter>
      <Button type="submit">保存</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### 4.2 业务组件

**筛选器栏：**
```typescript
<div className="flex gap-4 items-center p-4 bg-surface rounded-lg">
  <Select>
    <SelectTrigger className="w-[180px]">
      <SelectValue placeholder="选择分类" />
    </SelectTrigger>
    {/* 分类选项 */}
  </Select>

  <Popover>
    <PopoverTrigger asChild>
      <Button variant="outline">
        <CalendarIcon className="mr-2 h-4 w-4" />
        选择日期范围
      </Button>
    </Popover>
    <PopoverContent className="w-auto p-0">
      <Calendar mode="range" />
    </PopoverContent>
  </Popover>

  <Input
    placeholder="搜索描述..."
    className="flex-1 max-w-sm"
  />
</div>
```

**统计卡片：**
```typescript
<div className="grid gap-4 md:grid-cols-3">
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">本月总开支</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">¥3,250.00</div>
      <p className="text-xs text-muted-foreground">
        比上月减少 5.2%
      </p>
    </CardContent>
  </Card>

  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">平均每天</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">¥108.33</div>
    </CardContent>
  </Card>

  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">开支笔数</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">30</div>
    </CardContent>
  </Card>
</div>
```

## 5. 状态管理

### 5.1 Zustand Store 结构

**开支 Store：**
```typescript
interface Expense {
  id: string;
  amount: number;
  categoryId: string;
  description: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface ExpenseStore {
  expenses: Expense[];
  isLoading: boolean;
  error: string | null;

  // Actions
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateExpense: (id: string, expense: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  getExpensesByCategory: (categoryId: string) => Expense[];
  getExpensesByDateRange: (startDate: Date, endDate: Date) => Expense[];

  // Mock mode
  useMockMode: boolean;
}

export const useExpenseStore = create  persist(
   <ExpenseStore>()(
 (set, get) => ({
      expenses: MOCK_EXPENSES,  // 初始化使用 Mock 数据
      isLoading: false,
      error: null,
      useMockMode: true,  // 默认启用 Mock 模式

      addExpense: (expense) => {
        const newExpense: Expense = {
          ...expense,
          id: generateId(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({
          expenses: [newExpense, ...state.expenses],
        }));
      },

      updateExpense: (id, expense) => {
        set((state) => ({
          expenses: state.expenses.map((e) =>
            e.id === id ? { ...e, ...expense, updatedAt: new Date() } : e
          ),
        }));
      },

      deleteExpense: (id) => {
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== id),
        }));
      },

      getExpensesByCategory: (categoryId) => {
        return get().expenses.filter((e) => e.categoryId === categoryId);
      },

      getExpensesByDateRange: (startDate, endDate) => {
        return get().expenses.filter((e) => {
          const expenseDate = new Date(e.date);
          return expenseDate >= startDate && expenseDate <= endDate;
        });
      },
    }),
    {
      name: 'expense-tracker',
      partialize: (state) => ({ expenses: state.expenses, useMockMode: state.useMockMode }),
    }
  )
);
```

**分类 Store：**
```typescript
interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
  isPredefined: boolean;
}

interface CategoryStore {
  categories: Category[];

  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  getCategoryById: (id: string) => Category | undefined;
  getPredefinedCategories: () => Category[];
  getUserCategories: () => Category[];
}

export const useCategoryStore = create<CategoryStore>()(
  persist(
    (set, get) => ({
      categories: PREDEFINED_CATEGORIES,  // 初始化预定义分类

      addCategory: (category) => {
        const newCategory: Category = {
          ...category,
          id: generateId(),
        };
        set((state) => ({
          categories: [...state.categories, newCategory],
        }));
      },

      updateCategory: (id, category) => {
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? { ...c, ...category } : c
          ),
        }));
      },

      deleteCategory: (id) => {
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        }));
      },

      getCategoryById: (id) => {
        return get().categories.find((c) => c.id === id);
      },

      getPredefinedCategories: () => {
        return get().categories.filter((c) => c.isPredefined);
      },

      getUserCategories: () => {
        return get().categories.filter((c) => !c.isPredefined);
      },
    }),
    {
      name: 'expense-categories',
    }
  )
);
```

## 6. 功能独立性

### 6.1 Mock 模式配置

每个 Store 都有 `useMockMode` 标志，用于控制是否使用模拟数据：

```typescript
// 在组件中使用
const { expenses, useMockMode } = useExpenseStore();

return (
  <div>
    {useMockMode && (
      <Badge variant="secondary" className="mb-4">
        🎭 Demo Mode
      </Badge>
    )}
    {/* 组件内容 */}
  </div>
);
```

### 6.2 无阻塞依赖

- ✅ 开支列表页面无需登录即可使用（本地存储）
- ✅ 图表功能直接使用本地数据
- ✅ 分类管理基于本地数据
- ✅ 所有功能在首次加载时即可测试

## 7. Mock 数据

### 7.1 开支持续 Mock 数据

```typescript
export const MOCK_EXPENSES: Expense[] = [
  {
    id: '1',
    amount: 150.00,
    categoryId: 'food-1',
    description: '超市购物 - 蔬菜水果',
    date: new Date('2024-12-01'),
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date('2024-12-01'),
  },
  {
    id: '2',
    amount: 50.00,
    categoryId: 'transport-1',
    description: '地铁交通卡充值',
    date: new Date('2024-11-30'),
    createdAt: new Date('2024-11-30'),
    updatedAt: new Date('2024-11-30'),
  },
  // ... 更多数据
];
```

### 7.2 预定义分类数据

```typescript
export const PREDEFINED_CATEGORIES: Category[] = [
  {
    id: 'food-1',
    name: '食物餐饮',
    slug: 'food',
    color: '#ef4444',
    isPredefined: true,
  },
  {
    id: 'transport-1',
    name: '交通出行',
    slug: 'transport',
    color: '#3b82f6',
    isPredefined: true,
  },
  // ... 更多分类
];
```

### 7.3 数据生成器

```typescript
// 生成随机开支数据
export const generateRandomExpense = (): Expense => {
  const categories = PREDEFINED_CATEGORIES;
  const randomCategory = categories[Math.floor(Math.random() * categories.length)];
  const amount = Math.floor(Math.random() * 500) + 10;

  return {
    id: generateId(),
    amount,
    categoryId: randomCategory.id,
    description: `示例开支 ${amount}元`,
    date: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};
```

## 8. 核心功能

### 8.1 P0 功能（必须实现）

**1. 添加开支**
- 使用对话框组件
- 表单验证（金额、分类）
- 成功后添加到列表顶部
- 实时反馈

**2. 浏览开支列表**
- 卡片列表展示
- 分页或无限滚动
- 空状态处理

**3. 编辑/删除开支**
- 内联编辑
- 删除确认对话框
- 乐观更新

**4. 分类筛选**
- 下拉选择器
- 实时筛选
- 清除筛选

### 8.2 P1 功能（重要）

**1. 统计图表**
- 饼图（分类占比）
- 柱状图（月度趋势）
- 响应式图表

**2. 日期范围筛选**
- 日期选择器
- 快捷选项（今天、本周、本月）
- 组合筛选

**3. 搜索功能**
- 实时搜索描述
- 模糊匹配

### 8.3 P2 功能（增强）

**1. 分类管理**
- 创建自定义分类
- 编辑分类名称和颜色
- 删除分类

**2. 数据导出**
- CSV 格式导出
- 自定义日期范围
- 下载进度提示

## 9. 交互模式

### 9.1 加载状态

```typescript
// 骨架屏组件
const ExpenseListSkeleton = () => (
  <div className="space-y-4">
    {Array.from({ length: 5 }).map((_, i) => (
      <Card key={i}>
        <CardContent className="p-6">
          <Skeleton className="h-4 w-[250px] mb-2" />
          <Skeleton className="h-4 w-[200px]" />
        </CardContent>
      </Card>
    ))}
  </div>
);
```

### 9.2 空状态

```typescript
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-12">
    <FileTextIcon className="h-12 w-12 text-muted-foreground mb-4" />
    <h3 className="text-lg font-semibold mb-2">暂无开支记录</h3>
    <p className="text-muted-foreground mb-4">
      开始记录您的第一笔开支吧
    </p>
    <Button>
      <PlusIcon className="mr-2 h-4 w-4" />
      添加开支
    </Button>
  </div>
);
```

### 9.3 错误处理

```typescript
const ErrorMessage = ({ error }: { error: string }) => (
  <Alert variant="destructive">
    <AlertCircleIcon className="h-4 w-4" />
    <AlertTitle>错误</AlertTitle>
    <AlertDescription>{error}</AlertDescription>
  </Alert>
);
```

### 9.4 Toast 通知

```typescript
import { toast } from 'sonner';

// 成功通知
toast.success('开支记录已保存');

// 错误通知
toast.error('保存失败，请重试');

// 确认对话框
toast('确认删除？', {
  action: {
    label: '删除',
    onClick: () => deleteExpense(id),
  },
});
```

## 10. 可访问性 (WCAG)

### 10.1 键盘导航

- [ ] 所有交互元素可通过 Tab 键访问
- [ ] 有明确的焦点指示器
- [ ] 支持 Enter 和 Space 键激活
- [ ] 跳过链接（Skip to content）

### 10.2 屏幕阅读器

- [ ] 所有图片有 alt 属性
- [ ] 表单标签关联到输入框
- [ ] 状态变化有 aria-live 通知
- [ ] 图表有替代文本描述

### 10.3 色彩对比

- [ ] 文本对比度 ≥ 4.5:1
- [ ] 大文本对比度 ≥ 3:1
- [ ] 不仅依赖颜色传达信息
- [ ] 支持高对比度模式

### 10.4 语义 HTML

- [ ] 使用正确的 HTML 元素（button、link、heading）
- [ ] ARIA 标签仅在必要时使用
- [ ] 页面结构清晰（header、nav、main、footer）
- [ ] 表单使用 fieldset 和 legend

## 11. 扩展点

### 11.1 数据库迁移路径

**当前：** Zustand + localStorage
**目标：** PostgreSQL + Drizzle ORM

**迁移步骤：**
1. 添加 `src/lib/api/` 目录
2. 创建 API 客户端模块
3. 修改 Store 使用 API 而非本地状态
4. 逐步迁移数据
5. 移除 localStorage 依赖

**示例 API 客户端：**
```typescript
// src/lib/api/expenses.ts
export const expensesApi = {
  getAll: async (): Promise<Expense[]> => {
    const response = await fetch('/api/expenses');
    return response.json();
  },

  create: async (expense: CreateExpenseRequest): Promise<Expense> => {
    const response = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expense),
    });
    return response.json();
  },
};
```

### 11.2 认证集成路径

**当前：** 无认证（演示模式）
**目标：** NextAuth.js 认证

**集成步骤：**
1. 添加认证中间件
2. 修改 Store 包含用户信息
3. 添加登录/注册页面
4. API 路由添加认证检查

## 12. 验收检查清单

### 12.1 功能验收

- [ ] 用户可以添加新开支
- [ ] 用户可以编辑现有开支
- [ ] 用户可以删除开支
- [ ] 用户可以浏览开支列表
- [ ] 用户可以按分类筛选
- [ ] 用户可以按日期筛选
- [ ] 用户可以查看统计图表
- [ ] 筛选和搜索功能正常工作

### 12.2 交互验收

- [ ] 页面加载速度快（< 2秒）
- [ ] 动画流畅（60fps）
- [ ] 响应式设计在不同屏幕尺寸下正常显示
- [ ] 错误提示清晰友好
- [ ] 成功操作有明确反馈
- [ ] 加载状态可见

### 12.3 质量验收

- [ ] 代码遵循 TypeScript 最佳实践
- [ ] 组件可复用且模块化
- [ ] 状态管理清晰且可预测
- [ ] 错误处理完整
- [ ] 测试覆盖率 ≥ 80%

### 12.4 可访问性验收

- [ ] 键盘导航完整
- [ ] 屏幕阅读器兼容
- [ ] 色彩对比符合标准
- [ ] 语义 HTML 正确

### 12.5 性能验收

- [ ] 首次加载时间 < 2秒
- [ ] 交互响应时间 < 100ms
- [ ] 图片优化和懒加载
- [ ] 代码分割和动态导入
- [ ] 本地缓存有效

## 13. 开发优先级

### 阶段 1：核心功能 (第1周)

**优先级：P0**
- [ ] 项目初始化和基础布局
- [ ] 开支持续 Store
- [ ] 添加开支功能
- [ ] 浏览开支列表
- [ ] 编辑/删除开支

### 阶段 2：筛选和搜索 (第2周)

**优先级：P1**
- [ ] 分类筛选
- [ ] 日期筛选
- [ ] 搜索功能
- [ ] 组合筛选

### 阶段 3：统计和图表 (第3周)

**优先级：P1**
- [ ] 统计卡片
- [ ] 饼图实现
- [ ] 柱状图实现
- [ ] 图表交互

### 阶段 4：高级功能 (第4周)

**优先级：P2**
- [ ] 分类管理
- [ ] 数据导出
- [ ] 用户设置
- [ ] 性能优化

## 14. 技术债务和未来改进

### 14.1 技术债务

- [ ] 添加单元测试（Jest + React Testing Library）
- [ ] 添加 E2E 测试（Playwright）
- [ ] 添加 Storybook 组件文档
- [ ] 代码分割和懒加载
- [ ] PWA 支持

### 14.2 未来功能

- [ ] 预算设定和监控
- [ ] 开支预测
- [ ] 智能分类建议
- [ ] 家庭成员协作
- [ ] 多货币支持
- [ ] 数据导入/导出（Excel、CSV）
- [ ] 暗色模式
- [ ] 移动应用（PWA）

### 14.3 性能优化

- [ ] 虚拟列表（处理大量数据）
- [ ] 图表数据缓存
- [ ] Service Worker 缓存
- [ ] 图像优化和 WebP 格式
- [ ] CDN 静态资源加速

---

**文档版本：** 1.0.0
**创建日期：** 2024-12-01
**维护者：** 42COG Team
