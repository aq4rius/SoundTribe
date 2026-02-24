/**
 * Message & conversation types.
 *
 * CANONICAL: Prisma-derived (PrismaMessage, PrismaConversation).
 * TRANSITIONAL: IMessage, IConversation (Express/socket.io shapes).
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

// ─── Socket Event Types ────────────────────────────────────────────────────────

/** Payload for socket 'new-message' event (from Express server). */
export interface SocketNewMessage {
  _id: string;
  sender: { id: string; type: string };
  receiver: { id: string; type: string };
  text?: string;
  attachment?: string;
  status: string;
  createdAt: string;
}

/** Payload for socket 'messages-delivered' / 'messages-read' events. */
export interface SocketMessagesStatusUpdate {
  conversationId?: string;
  messageIds?: string[];
  senderId?: string;
  senderType?: string;
  receiverId?: string;
  receiverType?: string;
}

/** Payload for socket 'message-status-update' event. */
export interface SocketMessageStatusChange {
  messageId: string;
  status: string;
}

/** Payload for socket 'message-reaction' event. */
export interface SocketMessageReaction {
  messageId: string;
  senderId: string;
  receiverId: string;
  emoji: string;
  entityId: string;
  entityType: string;
}

/** Payload for socket 'user-typing' / 'user-stopped-typing' events. */
export interface SocketTypingEvent {
  senderId: string;
  senderType: string;
  conversationId?: string;
}

/** Shape of an unread count entry from the Express API. */
export interface UnreadCount {
  receiverId: string;
  receiverType: string;
  count: number;
}

// ─── Transitional Types (Express API shape) ────────────────────────────────────

/** @deprecated TRANSITIONAL */
export interface MessageEntity {
  id: string;
  type: string;
}

/**
 * @deprecated TRANSITIONAL — used by components still calling the Express API.
 */
export interface IMessage {
  _id: string;
  sender: MessageEntity;
  receiver: MessageEntity;
  text?: string;
  attachment?: string;
  status: string;
  reactions: MessageReaction[];
  createdAt: string;
  updatedAt: string;
}

/**
 * An entity the current user can act as in messaging.
 * Mapped from artist profiles and event postings belonging to the user.
 */
export interface ChatEntity {
  _id: string;
  name: string;
  type: string;
}

/** Conversation summary returned by GET /api/messages/conversations. */
export interface IConversation {
  entity: {
    _id: string;
    type: string;
    name: string;
  };
  lastMessage?: {
    text?: string;
    attachment?: string;
    isSentByMe?: boolean;
    createdAt: string;
  };
}
