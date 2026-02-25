'use server';

import { db } from '@/lib/db';
import { requireAuth, withActionHandler } from '@/lib/action-utils';
import type { ActionResult } from '@/types/actions';

// ─── Queries ───────────────────────────────────────────────────────────────────

export async function getNotificationsAction(
  page = 1,
  limit = 20,
): Promise<
  ActionResult<{
    data: Awaited<ReturnType<typeof db.notification.findMany>>;
    totalPages: number;
    unreadCount: number;
  }>
> {
  return withActionHandler(async () => {
    const auth = await requireAuth();
    if ('error' in auth) throw new Error(auth.error);

    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      db.notification.findMany({
        where: { recipientId: auth.session.user.id },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.notification.count({
        where: { recipientId: auth.session.user.id },
      }),
      db.notification.count({
        where: { recipientId: auth.session.user.id, read: false },
      }),
    ]);

    return {
      data: notifications,
      totalPages: Math.ceil(total / limit),
      unreadCount,
    };
  });
}

export async function getUnreadCountAction(): Promise<ActionResult<number>> {
  return withActionHandler(async () => {
    const auth = await requireAuth();
    if ('error' in auth) throw new Error(auth.error);

    return db.notification.count({
      where: { recipientId: auth.session.user.id, read: false },
    });
  });
}

// ─── Mutations ─────────────────────────────────────────────────────────────────

export async function markAsReadAction(id: string): Promise<ActionResult<void>> {
  return withActionHandler(async () => {
    const auth = await requireAuth();
    if ('error' in auth) throw new Error(auth.error);

    const notification = await db.notification.findUnique({
      where: { id },
      select: { recipientId: true },
    });
    if (!notification) throw new Error('Notification not found');
    if (notification.recipientId !== auth.session.user.id) {
      throw new Error('You can only mark your own notifications as read');
    }

    await db.notification.update({
      where: { id },
      data: { read: true },
    });
  });
}

export async function markAllAsReadAction(): Promise<ActionResult<void>> {
  return withActionHandler(async () => {
    const auth = await requireAuth();
    if ('error' in auth) throw new Error(auth.error);

    await db.notification.updateMany({
      where: { recipientId: auth.session.user.id, read: false },
      data: { read: true },
    });
  });
}
