import { useQuery } from '@tanstack/react-query';
import type { Entity, Message } from './useMyEntities';

export function useConversations(sender: Entity | null, token?: string) {
  return useQuery({
    queryKey: ['conversations', sender?._id, sender?.type],
    queryFn: async () => {
      if (!sender) return [];
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/messages/conversations?senderId=${sender._id}&senderType=${sender.type}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) throw new Error('Failed to fetch conversations');
      return res.json();
    },
    enabled: !!sender && !!token,
    refetchInterval: 10000,
  });
}

export function useMessages(sender: Entity | null, receiver: Entity | null, token?: string) {
  return useQuery({
    queryKey: ['messages', sender?._id, sender?.type, receiver?._id, receiver?.type],
    queryFn: async () => {
      if (!sender || !receiver) return { messages: [] };
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/messages/convo?senderId=${sender._id}&senderType=${sender.type}&receiverId=${receiver._id}&receiverType=${receiver.type}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) throw new Error('Failed to fetch messages');
      return res.json();
    },
    enabled: !!sender && !!receiver && !!token,
    refetchInterval: 5000,
  });
}
