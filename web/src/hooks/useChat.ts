import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
    // Reduce refetch frequency - only refetch when window regains focus or when manually triggered
    refetchInterval: false,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
    // Cache for 5 minutes
    staleTime: 5 * 60 * 1000,
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
    // Remove automatic refetching - rely on real-time updates via socket
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
    // Cache for 1 minute since we have real-time updates
    staleTime: 1 * 60 * 1000,
  });
}

export function useUnreadCounts(sender: Entity | null, token?: string) {
  return useQuery({
    queryKey: ['unread-counts', sender?._id, sender?.type],
    queryFn: async () => {
      if (!sender) return [];
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/messages/unread-counts?senderId=${sender._id}&senderType=${sender.type}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) throw new Error('Failed to fetch unread counts');
      return res.json();
    },
    enabled: !!sender && !!token,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function useMarkAsRead(token?: string) {
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
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/messages/mark-read`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            senderId,
            senderType,
            receiverId,
            receiverType,
          }),
        },
      );
      if (!res.ok) throw new Error('Failed to mark messages as read');
      return res.json();
    },
    onSuccess: (_data, variables) => {
      // Invalidate unread counts
      queryClient.invalidateQueries({
        queryKey: ['unread-counts', variables.senderId, variables.senderType],
      });
      // Invalidate messages
      queryClient.invalidateQueries({
        queryKey: ['messages', variables.senderId, variables.senderType, variables.receiverId, variables.receiverType],
      });
    },
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
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/messages/convo?senderId=${senderId}&senderType=${senderType}&receiverId=${receiverId}&receiverType=${receiverType}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
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
    mutationFn: async ({
      messageId,
      emoji,
    }: {
      messageId: string;
      emoji: string;
    }) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/messages/${messageId}/reaction`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ emoji }),
        },
      );
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