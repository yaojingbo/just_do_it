'use client';

import { useState } from 'react';
import { useExpenseStore } from '@/store/expense-store';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { formatCurrency } from '@/lib/utils';

interface DeleteConfirmationDialogProps {
  expense: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteConfirmationDialog({ expense, open, onOpenChange }: DeleteConfirmationDialogProps) {
  const { deleteExpense } = useExpenseStore();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const success = await deleteExpense(expense.id);
      if (success) {
        onOpenChange(false);
      } else {
        alert('删除失败，请重试');
      }
    } catch (error) {
      alert('删除开支时出错，请重试');
      console.error('删除开支错误:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>确认删除</DialogTitle>
          <DialogDescription>
            您确定要删除这笔开支吗？此操作无法撤销。
          </DialogDescription>
        </DialogHeader>
        {expense && (
          <div className="py-4">
            <div className="p-4 rounded-md bg-muted">
              <p className="font-semibold text-lg">{formatCurrency(expense.amount)}</p>
              <p className="text-sm text-muted-foreground mt-1">{expense.description}</p>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            取消
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                删除中...
              </>
            ) : (
              '确认删除'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
