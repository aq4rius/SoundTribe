/**
 * Message & conversation types.
 *
 * Prisma-derived (PrismaMessage, PrismaConversation).
 */

import type { Prisma } from '@prisma/client';

// Re-export Prisma enums
export type { MessageStatus, EntityType } from '@prisma/client';

// ─── Prisma-Derived Types ──────────────────────────────────────────────────────

/** Full message from database. */
export type PrismaMessage = Prisma.MessageGetPayload<{
  include: {
    conversation: true;
  };
}>;

/** Full conversation with messages. */
export type PrismaConversation = Prisma.ConversationGetPayload<{
  include: {
    messages: {
      orderBy: { createdAt: 'desc' };
      take: 1;
    };
  };
}>;

// ─── JSON sub-document shapes ──────────────────────────────────────────────────

export interface MessageReaction {
  emoji: string;
  entityId: string;
  entityType: string;
}
