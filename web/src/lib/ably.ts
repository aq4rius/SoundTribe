// Ably SDK version: 2.18.0
// Server-side Ably client — never import this in client components

import Ably from 'ably';
import { env } from '@/lib/env';

// Singleton server client
const ablyServer = new Ably.Rest(env.ABLY_API_KEY!);

/**
 * Publishes a message to an Ably channel from the server side.
 * Used inside Server Actions after a database write.
 */
export async function publishToChannel(
  channelName: string,
  eventName: string,
  data: unknown,
): Promise<void> {
  const channel = ablyServer.channels.get(channelName);
  await channel.publish(eventName, data);
}

/**
 * Channel naming conventions:
 * - conversation:{conversationId}  → messages in a specific conversation
 * - notifications:{userId}         → real-time notifications for a user
 * - presence:{conversationId}      → typing indicators
 */
export const channelNames = {
  conversation: (id: string) => `conversation:${id}`,
  notifications: (userId: string) => `notifications:${userId}`,
  presence: (conversationId: string) => `presence:${conversationId}`,
} as const;
