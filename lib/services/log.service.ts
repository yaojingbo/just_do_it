import { db } from '@/lib/db/connection';
import { accessLogs } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

interface LogAccessParams {
  userId?: string;
  action: string;
  resource: string;
  resourceId: string;
  success: boolean;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * 记录访问日志（实现业务约束 C4）
 */
export async function logAccess(params: LogAccessParams): Promise<void> {
  try {
    await db.insert(accessLogs).values({
      userId: params.userId,
      action: params.action,
      resource: params.resource,
      resourceId: params.resourceId,
      success: params.success,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });
  } catch (error) {
    // 静默失败，不影响业务逻辑
    console.error('记录访问日志失败:', error);
  }
}

/**
 * 获取用户的访问日志
 */
export async function getUserAccessLogs(
  userId: string,
  limit: number = 50
) {
  try {
    const logs = await db
      .select()
      .from(accessLogs)
      .where(eq(accessLogs.userId, userId))
      .limit(limit);

    return logs;
  } catch (error) {
    console.error('获取访问日志失败:', error);
    return [];
  }
}

/**
 * 清理过期日志（管理员功能）
 */
export async function cleanOldLogs(daysOld: number = 90): Promise<number> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await db
      .delete(accessLogs)
      .where(eq(accessLogs.createdAt, cutoffDate));

    return result.rowCount;
  } catch (error) {
    console.error('清理过期日志失败:', error);
    return 0;
  }
}
