import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ChatEntity, IMessage, IConversation } from '@/types';
import { env } from '@/lib/env';

// TRANSITIONAL: auth header removed until Phase 3
export function useConversations(sender: ChatEntity | null, token?: string) {
  return useQuery<IConversation[]>({
    queryKey: ['conversations', sender?._id, sender?.type],
    queryFn: async () => {
      if (!sender) return [];
      const res = await fetch(
        `${env.NEXT_PUBLIC_API_URL}/api/messages/conversations?senderId=${sender._id}&senderType=${sender.type}`,
        {
          headers: {},
        },
      );
      if (!res.ok) throw new Error('Failed to fetch conversations');
      return res.json();
    },
    enabled: !!sender && !!token,
    refetchInterval: false,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    staleTime: 5 * 60 * 1000,
  });
}

export function useMessages(
  sender: ChatEntity | null,
  receiver: ChatEntity | null,
  token?: string,
) {
  return useQuery<{ messages: IMessage[] }>({
    queryKey: ['messages', sender?._id, sender?.type, receiver?._id, receiver?.type],
    queryFn: async () => {
      if (!sender || !receiver) return { messages: [] };
      const res = await fetch(
        `${env.NEXT_PUBLIC_API_URL}/api/messages/convo?senderId=${sender._id}&senderType=${sender.type}&receiverId=${receiver._id}&receiverType=${receiver.type}`,
        {
          headers: {},
        },
      );
      if (!res.ok) throw new Error('Failed to fetch messages');
      return res.json();
    },
    enabled: !!sender && !!receiver && !!token,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
    staleTime: 1 * 60 * 1000,
  });
}

export function useUnreadCounts(sender: ChatEntity | null, token?: string) {
  return useQuery<{ receiverId: string; receiverType: string; count: number }[]>({
    queryKey: ['unread-counts', sender?._id, sender?.type],
    queryFn: async () => {
      if (!sender) return [];
      const res = await fetch(
        `${env.NEXT_PUBLIC_API_URL}/api/messages/unread-counts?senderId=${sender._id}&senderType=${sender.type}`,
        {
          headers: {},
        },
      );
      if (!res.ok) throw new Error('Failed to fetch unread counts');
      return res.json();
    },
    enabled: !!sender && !!token,
    refetchInterval: 30000,
  });
}

export function useDeleteConversation(token?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      senderId,
      senderType,
      receiverId,
      receiverType,
    }: {
      senderId: string;
      senderType: string;
      receiverId: string;
      receiverType: string;
    }) => {
      const res = await fetch(
        `${env.NEXT_PUBLIC_API_URL}/api/messages/convo?senderId=${senderId}&senderType=${senderType}&receiverId=${receiverId}&receiverType=${receiverType}`,
        {
          method: 'DELETE',
          headers: {},
        },
      );
      if (!res.ok) throw new Error('Failed to delete conversation');
      return res.json();
    },
    onSuccess: (_data, variables) => {
      // Invalidate conversations
      queryClient.invalidateQueries({
        queryKey: ['conversations', variables.senderId, variables.senderType],
      });
      // Invalidate unread counts
      queryClient.invalidateQueries({
        queryKey: ['unread-counts', variables.senderId, variables.senderType],
      });
    },
  });
}

export function useAddReaction(token?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ messageId, emoji }: { messageId: string; emoji: string }) => {
      const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/messages/${messageId}/reaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emoji }),
      });
      if (!res.ok) throw new Error('Failed to add reaction');
      return res.json();
    },
    onSuccess: () => {
      // Invalidate all messages queries to refresh reactions
      queryClient.invalidateQueries({
        queryKey: ['messages'],
      });
    },
  });
}

export function useRemoveReaction(token?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ messageId, emoji }: { messageId: string; emoji: string }) => {
      const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/messages/${messageId}/reaction`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emoji }),
      });
      if (!res.ok) throw new Error('Failed to remove reaction');
      return res.json();
    },
    onSuccess: () => {
      // Invalidate all messages queries to refresh reactions
      queryClient.invalidateQueries({
        queryKey: ['messages'],
      });
    },
  });
}
