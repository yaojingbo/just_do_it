'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useExpenseStore } from '@/store/expense-store';
import { useCategoryStore } from '@/store/category-store';
import { useAuthStore } from '@/store/auth-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { LoadingScreen } from '@/components/ui/loading-spinner';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { AddExpenseDialog } from '@/components/expense/AddExpenseDialog';
import { EditExpenseDialog } from '@/components/expense/EditExpenseDialog';
import { DeleteConfirmationDialog } from '@/components/expense/DeleteConfirmationDialog';
import { StatisticsChart } from '@/components/expense/StatisticsChart';
import { formatCurrency, formatDateShort } from '@/lib/utils';
import { exportToCSV } from '@/lib/utils/export';
import { Plus, TrendingUp, TrendingDown, Wallet, Trash2, Edit, LogOut, Download } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { expenses, isLoading: expensesLoading, error: expensesError, fetchExpenses, addExpense, updateExpense, deleteExpense, initialized: expensesInit } = useExpenseStore();
  const { categories, isLoading: categoriesLoading, fetchCategories, getCategoryById, initialized: categoriesInit } = useCategoryStore();
  const { user, fetchSession, logout, isLoading: authLoading, initialized: authInit } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);

  // 初始化时检查认证状态
  useEffect(() => {
    if (!authInit) {
      fetchSession().then((isAuthenticated) => {
        if (!isAuthenticated) {
          router.push('/login');
        }
      });
    } else if (authInit && !user) {
      router.push('/login');
    }
  }, [authInit, user, fetchSession]);

  // 初始化时获取数据
  useEffect(() => {
    if (!expensesInit) {
      fetchExpenses();
    }
    if (!categoriesInit) {
      fetchCategories();
    }
  }, [expensesInit, categoriesInit, fetchExpenses, fetchCategories]);

  // 如果未认证或正在加载，显示加载状态
  if (!authInit || authLoading || !user) {
    return <LoadingScreen message="正在验证身份..." />;
  }

  const handleLogout = async () => {
    const success = await logout();
    if (success) {
      router.push('/login');
    }
  };

  const handleAddExpense = () => {
    setAddDialogOpen(true);
  };

  const handleEditExpense = (expense: any) => {
    setSelectedExpense(expense);
    setEditDialogOpen(true);
  };

  const handleDeleteExpense = (expense: any) => {
    setSelectedExpense(expense);
    setDeleteDialogOpen(true);
  };

  const handleExportCSV = async () => {
    try {
      await exportToCSV();
      alert('导出成功！');
    } catch (error) {
      alert('导出失败，请重试');
      console.error('导出错误:', error);
    }
  };

  const totalAmount = expenses.reduce((sum, exp) => {
    const amount = typeof exp.amount === 'string' ? Number(exp.amount) : exp.amount;
    return sum + amount;
  }, 0);
  const thisMonthExpenses = expenses.filter(exp => {
    const expDate = new Date(exp.date);
    const now = new Date();
    return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
  });
  const thisMonthTotal = thisMonthExpenses.reduce((sum, exp) => {
    const amount = typeof exp.amount === 'string' ? Number(exp.amount) : exp.amount;
    return sum + amount;
  }, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-xl sm:text-2xl font-bold">家庭开销记录器</h1>
            <div className="flex items-center gap-2 sm:gap-4">
              <ThemeToggle />
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs sm:text-sm text-muted-foreground">
                  欢迎，{user.name || user.email}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-1.5 sm:gap-2"
              >
                <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">登出</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 sm:py-8">
        {/* Statistics Cards */}
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-6 sm:mb-8">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">总开支</CardTitle>
              <Wallet className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">
                {expensesLoading ? <Skeleton className="h-8 w-24" /> : formatCurrency(totalAmount)}
              </div>
              <p className="text-xs text-muted-foreground">
                共 {expenses.length} 笔记录
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">本月开支</CardTitle>
              <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">
                {expensesLoading ? <Skeleton className="h-8 w-24" /> : formatCurrency(thisMonthTotal)}
              </div>
              <p className="text-xs text-muted-foreground">
                本月已有 {thisMonthExpenses.length} 笔
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">平均每天</CardTitle>
              <TrendingDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">
                {expensesLoading ? <Skeleton className="h-8 w-24" /> : formatCurrency(Number(thisMonthTotal) / new Date().getDate())}
              </div>
              <p className="text-xs text-muted-foreground">
                本月平均
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Statistics Charts */}
        {!expensesLoading && expenses.length > 0 && (
          <StatisticsChart expenses={expenses} categories={categories} />
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <h2 className="text-lg sm:text-xl font-semibold">开支记录</h2>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              onClick={handleExportCSV}
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none"
            >
              <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="ml-1.5">导出CSV</span>
            </Button>
            <Button
              onClick={handleAddExpense}
              size="sm"
              className="flex-1 sm:flex-none"
              disabled={isSubmitting}
            >
              <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="ml-1.5">添加开支</span>
            </Button>
          </div>
        </div>

        {/* Expenses List */}
        <div className="space-y-3 sm:space-y-4">
          {expensesLoading ? (
            // 加载骨架屏
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-5 w-16" />
                      </div>
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                    <div className="flex gap-1.5 sm:gap-2">
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : expenses.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Wallet className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">暂无开支记录</h3>
                <p className="text-muted-foreground mb-4 text-center">
                  开始记录您的第一笔开支吧
                </p>
                <Button onClick={handleAddExpense} size="sm" className="flex items-center gap-2">
                  <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  添加开支
                </Button>
              </CardContent>
            </Card>
          ) : (
            expenses.map((expense) => {
              const category = getCategoryById(expense.categoryId);
              return (
                <Card key={expense.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4">
                      <div className="flex-1 w-full">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                          <h3 className="text-base sm:text-lg font-semibold">
                            {formatCurrency(expense.amount)}
                          </h3>
                          {category && (
                            <Badge
                              variant="secondary"
                              className="text-xs"
                              style={{ backgroundColor: category.color + '20', color: category.color }}
                            >
                              {category.name}
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground mb-1 break-words">
                          {expense.description}
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {formatDateShort(expense.date)}
                        </p>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditExpense(expense)}
                          className="flex-1 sm:flex-none"
                        >
                          编辑
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive flex-1 sm:flex-none"
                          onClick={() => handleDeleteExpense(expense)}
                        >
                          <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          <span className="sm:hidden ml-1">删除</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </main>

      {/* Dialogs */}
      <AddExpenseDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
      {selectedExpense && (
        <>
          <EditExpenseDialog
            expense={selectedExpense}
            open={editDialogOpen}
            onOpenChange={(open) => {
              setEditDialogOpen(open);
              if (!open) setSelectedExpense(null);
            }}
          />
          <DeleteConfirmationDialog
            expense={selectedExpense}
            open={deleteDialogOpen}
            onOpenChange={(open) => {
              setDeleteDialogOpen(open);
              if (!open) setSelectedExpense(null);
            }}
          />
        </>
      )}
    </div>
  );
}
