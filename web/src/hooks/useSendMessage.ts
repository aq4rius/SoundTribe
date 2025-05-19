import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Entity } from './useMyEntities';

export function useSendMessage(token?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      sender,
      receiver,
      text,
      file,
    }: {
      sender: Entity;
      receiver: Entity;
      text: string;
      file?: File | null;
    }) => {
      const formData = new FormData();
      formData.append('senderId', sender._id);
      formData.append('senderType', sender.type);
      formData.append('receiverId', receiver._id);
      formData.append('receiverType', receiver.type);
      formData.append('text', text);
      if (file) formData.append('file', file);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/messages`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        },
      );
      if (!res.ok) throw new Error('Failed to send message');
      return res.json();
    },
    onSuccess: (_data, variables) => {
      // Invalidate messages for this conversation
      queryClient.invalidateQueries({
        queryKey: [
          'messages',
          variables.sender._id,
          variables.sender.type,
          variables.receiver._id,
          variables.receiver.type,
        ],
      });
      // Optionally, invalidate conversations
      queryClient.invalidateQueries({
        queryKey: ['conversations', variables.sender._id, variables.sender.type],
      });
    },
  });
}
