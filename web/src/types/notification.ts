/**
 * Notification types.
 *
 * Prisma-derived (PrismaNotification).
 */

import type { Prisma } from '@prisma/client';

// Re-export Prisma enum
export type { NotificationType } from '@prisma/client';

// ─── Prisma-Derived Types ──────────────────────────────────────────────────────

/** Full notification from database. */
export type PrismaNotification = Prisma.NotificationGetPayload<{
  include: {
    recipient: { select: { id: true; username: true } };
  };
}>;
