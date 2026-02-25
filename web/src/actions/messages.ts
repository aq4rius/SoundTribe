'use server';

import { db } from '@/lib/db';
import { requireAuth, withActionHandler } from '@/lib/action-utils';
import type { ActionResult } from '@/types/actions';
import { publishToChannel, channelNames } from '@/lib/ably';
import { EntityType } from '@prisma/client';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface SendMessageInput {
  conversationId?: string;
  receiverEntityId: string;
  receiverEntityType: EntityType;
  senderEntityId: string;
  senderEntityType: EntityType;
  content?: string;
  attachmentUrl?: string;
  attachmentType?: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Verify that the authenticated user owns the given entity.
 * Returns the owner's userId (for notifications) or throws.
 */
async function verifyEntityOwnership(
  entityId: string,
  entityType: EntityType,
  userId: string,
): Promise<void> {
  if (entityType === EntityType.artist_profile) {
    const profile = await db.artistProfile.findUnique({
      where: { id: entityId },
      select: { userId: true },
    });
    if (!profile) throw new Error('Artist profile not found');
    if (profile.userId !== userId) throw new Error('You do not own this artist profile');
  } else if (entityType === EntityType.event_posting) {
    const event = await db.eventPosting.findUnique({
      where: { id: entityId },
      select: { organizerId: true },
    });
    if (!event) throw new Error('Event not found');
    if (event.organizerId !== userId) throw new Error('You do not own this event');
  }
}

/**
 * Get the userId that owns an entity (for sending notifications).
 */
async function getEntityOwner(
  entityId: string,
  entityType: EntityType,
): Promise<string> {
  if (entityType === EntityType.artist_profile) {
    const profile = await db.artistProfile.findUnique({
      where: { id: entityId },
      select: { userId: true },
    });
    if (!profile) throw new Error('Artist profile not found');
    return profile.userId;
  } else {
    const event = await db.eventPosting.findUnique({
      where: { id: entityId },
      select: { organizerId: true },
    });
    if (!event) throw new Error('Event not found');
    return event.organizerId;
  }
}

/**
 * Finds or creates a conversation between two entities.
 * Normalizes entity order for the unique constraint.
 */
async function findOrCreateConversation(
  entity1Id: string,
  entity1Type: EntityType,
  entity2Id: string,
  entity2Type: EntityType,
) {
  // Check both orderings
  let conversation = await db.conversation.findFirst({
    where: {
      OR: [
        {
          entity1Id,
          entity1Type,
          entity2Id,
          entity2Type,
        },
        {
          entity1Id: entity2Id,
          entity1Type: entity2Type,
          entity2Id: entity1Id,
          entity2Type: entity1Type,
        },
      ],
    },
  });

  if (!conversation) {
    conversation = await db.conversation.create({
      data: {
        entity1Id,
        entity1Type,
        entity2Id,
        entity2Type,
      },
    });
  }

  return conversation;
}

// ─── Queries ───────────────────────────────────────────────────────────────────

/**
 * Get all conversations for a given sender entity.
 * Returns conversations with last message and other entity info.
 */
export async function getConversationsAction(
  senderEntityId: string,
  senderEntityType: EntityType,
) {
  return withActionHandler(async () => {
    const auth = await requireAuth();
    if ('error' in auth) throw new Error(auth.error);

    await verifyEntityOwnership(senderEntityId, senderEntityType, auth.session.user.id);

    const conversations = await db.conversation.findMany({
      where: {
        OR: [
          { entity1Id: senderEntityId, entity1Type: senderEntityType },
          { entity2Id: senderEntityId, entity2Type: senderEntityType },
        ],
      },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    });

    // Enrich with entity names for display
    const enriched = await Promise.all(
      conversations.map(async (conv) => {
        // Determine the "other" entity
        const isEntity1 =
          conv.entity1Id === senderEntityId && conv.entity1Type === senderEntityType;
        const otherEntityId = isEntity1 ? conv.entity2Id : conv.entity1Id;
        const otherEntityType = isEntity1 ? conv.entity2Type : conv.entity1Type;

        // Fetch entity name
        let otherEntityName = 'Unknown';
        let otherEntityImage: string | null = null;

        if (otherEntityType === EntityType.artist_profile) {
          const profile = await db.artistProfile.findUnique({
            where: { id: otherEntityId },
            select: { stageName: true, profileImage: true },
          });
          if (profile) {
            otherEntityName = profile.stageName;
            otherEntityImage = profile.profileImage;
          }
        } else {
          const event = await db.eventPosting.findUnique({
            where: { id: otherEntityId },
            select: { title: true },
          });
          if (event) {
            otherEntityName = event.title;
          }
        }

        // Count unread messages (messages not sent by sender)
        const unreadCount = await db.message.count({
          where: {
            conversationId: conv.id,
            senderEntityId: { not: senderEntityId },
            status: { not: 'read' },
            isDeleted: false,
          },
        });

        return {
          id: conv.id,
          otherEntity: {
            id: otherEntityId,
            type: otherEntityType,
            name: otherEntityName,
            image: otherEntityImage,
          },
          lastMessage: conv.messages[0] ?? null,
          unreadCount,
          lastMessageAt: conv.lastMessageAt,
          createdAt: conv.createdAt,
        };
      }),
    );

    return enriched;
  });
}

/**
 * Get messages for a conversation with pagination.
 * Returns messages in chronological order (oldest first).
 */
export async function getMessagesAction(
  conversationId: string,
  page = 1,
  limit = 50,
) {
  return withActionHandler(async () => {
    const auth = await requireAuth();
    if ('error' in auth) throw new Error(auth.error);

    // Verify the user is a participant
    const conversation = await db.conversation.findUnique({
      where: { id: conversationId },
    });
    if (!conversation) throw new Error('Conversation not found');

    // Check both entity sides
    const isEntity1Owner = await isUserEntityOwner(
      conversation.entity1Id,
      conversation.entity1Type,
      auth.session.user.id,
    );
    const isEntity2Owner = await isUserEntityOwner(
      conversation.entity2Id,
      conversation.entity2Type,
      auth.session.user.id,
    );
    if (!isEntity1Owner && !isEntity2Owner) {
      throw new Error('You are not a participant in this conversation');
    }

    const total = await db.message.count({
      where: { conversationId, isDeleted: false },
    });

    const skip = Math.max(0, total - page * limit);
    const take = page === Math.ceil(total / limit) ? total % limit || limit : limit;

    const messages = await db.message.findMany({
      where: { conversationId, isDeleted: false },
      orderBy: { createdAt: 'asc' },
      skip: Math.max(0, total - page * limit),
      take: limit,
    });

    return {
      messages,
      total,
      hasMore: page * limit < total,
      page,
    };
  });
}

/**
 * Check if a user owns an entity (helper for conversation access checks).
 */
async function isUserEntityOwner(
  entityId: string,
  entityType: EntityType,
  userId: string,
): Promise<boolean> {
  if (entityType === EntityType.artist_profile) {
    const profile = await db.artistProfile.findUnique({
      where: { id: entityId },
      select: { userId: true },
    });
    return profile?.userId === userId;
  } else {
    const event = await db.eventPosting.findUnique({
      where: { id: entityId },
      select: { organizerId: true },
    });
    return event?.organizerId === userId;
  }
}

/**
 * Get the user's entities (artist profiles + event postings) for the sender selector.
 */
export async function getMyEntitiesAction() {
  return withActionHandler(async () => {
    const auth = await requireAuth();
    if ('error' in auth) throw new Error(auth.error);

    const [artistProfiles, eventPostings] = await Promise.all([
      db.artistProfile.findMany({
        where: { userId: auth.session.user.id },
        select: {
          id: true,
          stageName: true,
          profileImage: true,
        },
      }),
      db.eventPosting.findMany({
        where: { organizerId: auth.session.user.id },
        select: {
          id: true,
          title: true,
        },
      }),
    ]);

    return {
      artistProfiles: artistProfiles.map((p) => ({
        id: p.id,
        name: p.stageName,
        type: EntityType.artist_profile,
        image: p.profileImage,
      })),
      eventPostings: eventPostings.map((e) => ({
        id: e.id,
        name: e.title,
        type: EntityType.event_posting,
        image: null,
      })),
    };
  });
}

// ─── Mutations ─────────────────────────────────────────────────────────────────

/**
 * Send a message in a conversation (or create a new conversation).
 */
export async function sendMessageAction(input: SendMessageInput) {
  return withActionHandler(async () => {
    const auth = await requireAuth();
    if ('error' in auth) throw new Error(auth.error);

    if (!input.content?.trim() && !input.attachmentUrl) {
      throw new Error('Message must have content or an attachment');
    }
    if (input.content && input.content.length > 2000) {
      throw new Error('Message content cannot exceed 2000 characters');
    }

    // Verify sender owns the entity
    await verifyEntityOwnership(
      input.senderEntityId,
      input.senderEntityType,
      auth.session.user.id,
    );

    // Find or create conversation
    const conversation = input.conversationId
      ? await db.conversation.findUnique({ where: { id: input.conversationId } })
      : await findOrCreateConversation(
          input.senderEntityId,
          input.senderEntityType,
          input.receiverEntityId,
          input.receiverEntityType,
        );

    if (!conversation) throw new Error('Conversation not found');

    // Create the message
    const newMessage = await db.message.create({
      data: {
        conversationId: conversation.id,
        senderEntityId: input.senderEntityId,
        senderEntityType: input.senderEntityType,
        content: input.content?.trim() || null,
        attachmentUrl: input.attachmentUrl || null,
        attachmentType: input.attachmentType || null,
        status: 'sent',
      },
    });

    // Update conversation's lastMessageAt
    await db.conversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: new Date() },
    });

    // Publish to Ably — real-time message delivery
    await publishToChannel(
      channelNames.conversation(conversation.id),
      'new-message',
      { message: newMessage, conversationId: conversation.id },
    );

    // Notify the receiver via Ably
    const receiverUserId = await getEntityOwner(
      input.receiverEntityId,
      input.receiverEntityType,
    );
    if (receiverUserId !== auth.session.user.id) {
      // Create a DB notification
      await db.notification.create({
        data: {
          recipientId: receiverUserId,
          type: 'new_message',
          title: 'New Message',
          message: input.content?.trim()?.slice(0, 100) || '[Attachment]',
          relatedConversationId: conversation.id,
        },
      });

      await publishToChannel(
        channelNames.notifications(receiverUserId),
        'new-notification',
        { type: 'new_message', conversationId: conversation.id },
      );
    }

    return { message: newMessage, conversationId: conversation.id };
  });
}

/**
 * Add a reaction to a message.
 */
export async function addReactionAction(
  messageId: string,
  emoji: string,
  entityId: string,
  entityType: EntityType,
) {
  return withActionHandler(async () => {
    const auth = await requireAuth();
    if ('error' in auth) throw new Error(auth.error);

    await verifyEntityOwnership(entityId, entityType, auth.session.user.id);

    const message = await db.message.findUnique({
      where: { id: messageId },
      select: { reactions: true, conversationId: true },
    });
    if (!message) throw new Error('Message not found');

    // Parse existing reactions
    const reactions = (message.reactions as Array<{
      emoji: string;
      entityId: string;
      entityType: string;
    }>) ?? [];

    // Toggle reaction
    const existingIndex = reactions.findIndex(
      (r) => r.emoji === emoji && r.entityId === entityId && r.entityType === entityType,
    );

    if (existingIndex >= 0) {
      reactions.splice(existingIndex, 1);
    } else {
      reactions.push({ emoji, entityId, entityType });
    }

    const updated = await db.message.update({
      where: { id: messageId },
      data: { reactions },
    });

    // Publish reaction update to conversation channel
    await publishToChannel(
      channelNames.conversation(message.conversationId),
      'reaction-update',
      { messageId, reactions: updated.reactions },
    );

    return updated;
  });
}

/**
 * Mark all messages in a conversation as read for the current user's entity.
 */
export async function markMessagesReadAction(
  conversationId: string,
  readerEntityId: string,
) {
  return withActionHandler(async () => {
    const auth = await requireAuth();
    if ('error' in auth) throw new Error(auth.error);

    // Update all unread messages not sent by reader
    const result = await db.message.updateMany({
      where: {
        conversationId,
        senderEntityId: { not: readerEntityId },
        status: { not: 'read' },
        isDeleted: false,
      },
      data: { status: 'read' },
    });

    // Publish read receipt to conversation channel
    if (result.count > 0) {
      await publishToChannel(
        channelNames.conversation(conversationId),
        'messages-read',
        { conversationId, readerEntityId, count: result.count },
      );
    }

    return { updated: result.count };
  });
}

/**
 * Delete (soft-delete) a message.
 */
export async function deleteMessageAction(messageId: string) {
  return withActionHandler(async () => {
    const auth = await requireAuth();
    if ('error' in auth) throw new Error(auth.error);

    const message = await db.message.findUnique({
      where: { id: messageId },
      select: {
        senderEntityId: true,
        senderEntityType: true,
        conversationId: true,
      },
    });
    if (!message) throw new Error('Message not found');

    // Verify the sender owns the message
    await verifyEntityOwnership(
      message.senderEntityId,
      message.senderEntityType,
      auth.session.user.id,
    );

    await db.message.update({
      where: { id: messageId },
      data: { isDeleted: true },
    });

    // Publish deletion to conversation channel
    await publishToChannel(
      channelNames.conversation(message.conversationId),
      'message-deleted',
      { messageId, conversationId: message.conversationId },
    );
  });
}

/**
 * Delete a conversation and all its messages.
 */
export async function deleteConversationAction(conversationId: string) {
  return withActionHandler(async () => {
    const auth = await requireAuth();
    if ('error' in auth) throw new Error(auth.error);

    const conversation = await db.conversation.findUnique({
      where: { id: conversationId },
    });
    if (!conversation) throw new Error('Conversation not found');

    // Verify the user owns one of the entities
    const isEntity1Owner = await isUserEntityOwner(
      conversation.entity1Id,
      conversation.entity1Type,
      auth.session.user.id,
    );
    const isEntity2Owner = await isUserEntityOwner(
      conversation.entity2Id,
      conversation.entity2Type,
      auth.session.user.id,
    );
    if (!isEntity1Owner && !isEntity2Owner) {
      throw new Error('You are not a participant in this conversation');
    }

    // Cascade delete handles messages
    await db.conversation.delete({ where: { id: conversationId } });
  });
}
