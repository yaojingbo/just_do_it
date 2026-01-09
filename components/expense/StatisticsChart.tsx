'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface Expense {
  id: string;
  amount: number;
  categoryId: string;
  description: string;
  date: Date;
  category?: {
    name: string;
    color: string;
  };
}

interface Category {
  id: string;
  name: string;
  color: string;
}

interface StatisticsChartProps {
  expenses: Expense[];
  categories: Category[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'];

export function StatisticsChart({ expenses, categories }: StatisticsChartProps) {
  const expenseByCategory = useMemo(() => {
    const categoryMap = categories.reduce((acc, cat) => {
      acc[cat.id] = { name: cat.name, color: cat.color, amount: 0 };
      return acc;
    }, {} as Record<string, { name: string; color: string; amount: number }>);

    expenses.forEach(expense => {
      if (categoryMap[expense.categoryId]) {
        const amount = typeof expense.amount === 'string' ? Number(expense.amount) : expense.amount;
        categoryMap[expense.categoryId].amount += amount;
      }
    });

    return Object.values(categoryMap)
      .filter(item => item.amount > 0)
      .map(item => ({
        ...item,
        amount: Number(item.amount.toFixed(2))
      }));
  }, [expenses, categories]);

  const monthlyExpenses = useMemo(() => {
    const monthlyMap = new Map<string, number>();

    expenses.forEach(expense => {
      const date = new Date(expense.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const amount = typeof expense.amount === 'string' ? Number(expense.amount) : expense.amount;
      monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + amount);
    });

    const sortedMonths = Array.from(monthlyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6);

    return sortedMonths.map(([month, amount]) => ({
      month,
      amount: Number(amount.toFixed(2))
    }));
  }, [expenses]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-3 border rounded-md shadow-lg">
          <p className="font-semibold">{label}</p>
          <p className="text-primary">
            {`金额: ${formatCurrency(payload[0].value)}`}
          </p>
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background p-3 border rounded-md shadow-lg">
          <p className="font-semibold">{data.name}</p>
          <p className="text-primary">
            {`金额: ${formatCurrency(data.amount)}`}
          </p>
          <p className="text-sm text-muted-foreground">
            {`占比: ${((data.amount / expenses.reduce((sum, e) => sum + e.amount, 0)) * 100).toFixed(1)}%`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2 mb-6 sm:mb-8">
      {/* Expenses by Category - Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">分类支出分布</CardTitle>
          <CardDescription>按分类统计的开支占比</CardDescription>
        </CardHeader>
        <CardContent>
          {expenseByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {expenseByCategory.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color || COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              暂无数据
            </div>
          )}
        </CardContent>
      </Card>

      {/* Monthly Expenses - Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">月度开支趋势</CardTitle>
          <CardDescription>最近6个月的开支变化</CardDescription>
        </CardHeader>
        <CardContent>
          {monthlyExpenses.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyExpenses}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="amount" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              暂无数据
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
