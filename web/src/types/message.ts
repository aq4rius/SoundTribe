/**
 * Message types — mirrors server/src/models/Message.ts
 *
 * IMPORTANT: Messaging is entity-to-entity, NOT user-to-user.
 * sender/receiver are { id, type } where type is 'ArtistProfile' | 'Event'.
 * This allows an artist profile to message an event posting and vice versa.
 */

export type EntityType = 'ArtistProfile' | 'Event';
export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface MessageEntity {
  id: string;
  type: EntityType;
}

export interface MessageReaction {
  userId: string;
  emoji: string;
  createdAt: string;
}

export interface IMessage {
  _id: string;
  sender: MessageEntity;
  receiver: MessageEntity;
  text?: string;
  attachment?: string;
  status: MessageStatus;
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
  type: EntityType;
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
