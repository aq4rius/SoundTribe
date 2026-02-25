'use client';

import { useEffect, useRef, useState } from 'react';
import Ably from 'ably';

// Singleton Ably Realtime client for the browser.
// Created once, reused across all hook instances.
let ablyClient: Ably.Realtime | null = null;

export function getAblyClient(): Ably.Realtime {
  if (!ablyClient) {
    ablyClient = new Ably.Realtime({
      authUrl: '/api/ably-auth',
      authMethod: 'GET',
    });
  }
  return ablyClient;
}

interface UseAblyChannelOptions<T> {
  channelName: string;
  eventName: string;
  onMessage: (message: T) => void;
  enabled?: boolean;
}

/**
 * Subscribes to an Ably channel event.
 * Automatically subscribes on mount and unsubscribes on unmount.
 */
export function useAblyChannel<T>({
  channelName,
  eventName,
  onMessage,
  enabled = true,
}: UseAblyChannelOptions<T>) {
  const [connectionStatus, setConnectionStatus] = useState<string>('initialized');
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    if (!enabled) return;

    const client = getAblyClient();
    const channel = client.channels.get(channelName);

    const connectionListener = (stateChange: Ably.ConnectionStateChange) => {
      setConnectionStatus(stateChange.current);
    };
    client.connection.on(connectionListener);

    const messageHandler = (message: Ably.Message) => {
      onMessageRef.current(message.data as T);
    };
    channel.subscribe(eventName, messageHandler);

    return () => {
      channel.unsubscribe(eventName, messageHandler);
      client.connection.off(connectionListener);
    };
  }, [channelName, eventName, enabled]);

  return { connectionStatus };
}

/**
 * Hook for Ably presence (typing indicators).
 * Enters presence on mount, leaves on unmount.
 */
export function useAblyPresence(
  conversationId: string,
  enabled = true,
) {
  const [members, setMembers] = useState<Ably.PresenceMessage[]>([]);

  useEffect(() => {
    if (!enabled || !conversationId) return;

    const client = getAblyClient();
    const channel = client.channels.get(`presence:${conversationId}`);

    const syncMembers = async () => {
      try {
        const presenceMessages = await channel.presence.get();
        setMembers(presenceMessages);
      } catch {
        // Ignore errors during initial sync
      }
    };

    const handlePresenceUpdate = () => {
      syncMembers();
    };

    channel.presence.subscribe('enter', handlePresenceUpdate);
    channel.presence.subscribe('leave', handlePresenceUpdate);
    channel.presence.subscribe('update', handlePresenceUpdate);

    channel.presence.enter({ typing: false });
    syncMembers();

    return () => {
      channel.presence.unsubscribe('enter', handlePresenceUpdate);
      channel.presence.unsubscribe('leave', handlePresenceUpdate);
      channel.presence.unsubscribe('update', handlePresenceUpdate);
      channel.presence.leave();
    };
  }, [conversationId, enabled]);

  const updatePresence = async (data: Record<string, unknown>) => {
    if (!conversationId) return;
    const client = getAblyClient();
    const channel = client.channels.get(`presence:${conversationId}`);
    await channel.presence.update(data);
  };

  return { members, updatePresence };
}
