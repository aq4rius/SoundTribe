/**
 * Notification types.
 *
 * CANONICAL: Prisma-derived (PrismaNotification).
 * TRANSITIONAL: INotification (Express API shape with _id).
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

// ─── Transitional Types (Express API shape) ────────────────────────────────────

/** @deprecated TRANSITIONAL */
export interface NotificationRelatedEntity {
  id: string;
  type: string;
}

/**
 * @deprecated TRANSITIONAL — used by components still calling the Express API.
 */
export interface INotification {
  _id: string;
  recipient: string;
  type: string;
  content: string;
  read: boolean;
  createdAt: string;
  relatedEntity?: NotificationRelatedEntity;
}
