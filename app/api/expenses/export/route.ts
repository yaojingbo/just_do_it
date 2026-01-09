import { NextRequest, NextResponse } from 'next/server';
import { ExpenseDAO } from '@/lib/db/expense-dao';
import { requireAuth } from '@/lib/middleware/auth';
import { logAccess } from '@/lib/services/log.service';

// CSV export helper
function generateCSV(expenses: any[]): string {
  const headers = ['日期', '金额', '分类', '描述', '创建时间'];
  const rows = expenses.map(expense => [
    new Date(expense.date).toISOString().split('T')[0],
    expense.amount.toString(),
    expense.category?.name || '未知分类',
    expense.description,
    new Date(expense.createdAt).toISOString()
  ]);

  return [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
}

// Check database connection
let isDatabaseConnected = false;
let isCheckingConnection = false;

async function checkDatabaseConnection() {
  if (isCheckingConnection) return isDatabaseConnected;
  isCheckingConnection = true;

  try {
    const { checkDatabaseConnection } = await import('@/lib/db/connection');
    isDatabaseConnected = await checkDatabaseConnection();
  } catch (error) {
    console.error('Database connection check failed:', error);
    isDatabaseConnected = false;
  } finally {
    isCheckingConnection = false;
  }

  return isDatabaseConnected;
}

// GET /api/expenses/export - Export expenses to CSV
export async function GET(request: NextRequest) {
  try {
    // Get current user session
    const session = await requireAuth(request);
    const userId = session.userId;

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';

    // Check database connection
    const dbConnected = await checkDatabaseConnection();

    if (!dbConnected) {
      return NextResponse.json(
        {
          success: false,
          error: '数据库未连接，无法导出数据',
        },
        { status: 503 }
      );
    }

    // Get all expenses for the user (with category info)
    const expenses = await ExpenseDAO.findByUserId(userId, {
      page: 1,
      limit: 10000, // Large limit to get all expenses
      sortBy: 'date',
      sortOrder: 'desc',
    });

    if (format === 'csv') {
      const csv = generateCSV(expenses);

      await logAccess({
        userId,
        action: 'EXPORT',
        resource: 'expenses',
        resourceId: 'csv',
        success: true,
        ipAddress: request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      });

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="expenses-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: '不支持的导出格式',
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('导出失败:', error);

    return NextResponse.json(
      {
        success: false,
        error: '导出失败',
        details: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}
