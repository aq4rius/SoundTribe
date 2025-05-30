import { useMutation, useQueryClient } from '@tanstack/react-query';
import imageCompression from 'browser-image-compression';
import type { Entity } from './useMyEntities';

export function useSendMessage(token?: string) {
  const queryClient = useQueryClient();
  
  const compressFile = async (file: File): Promise<File> => {
    // Only compress images
    if (!file.type.startsWith('image/')) {
      return file;
    }
    
    // If file is already under 8MB, don't compress
    if (file.size <= 8 * 1024 * 1024) {
      return file;
    }
    
    console.log('🔄 Compressing image:', file.name, 'Original size:', file.size);
    
    const options = {
      maxSizeMB: 8, // Target 8MB max
      maxWidthOrHeight: 1920, // Max dimension
      useWebWorker: true,
      fileType: 'image/jpeg', // Convert to JPEG for better compression
      quality: 0.8, // 80% quality
    };
    
    try {
      const compressedFile = await imageCompression(file, options);
      console.log('✅ Image compressed:', compressedFile.name, 'New size:', compressedFile.size);
      return compressedFile;
    } catch (error) {
      console.error('❌ Compression failed, using original:', error);
      return file;
    }
  };

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
      console.log('Sending message with:', { sender, receiver, text, file });
      
      let processedFile = file;
      
      // Compress file if needed
      if (file) {
        processedFile = await compressFile(file);
      }
      
      const formData = new FormData();
      formData.append('senderId', sender._id);
      formData.append('senderType', sender.type);
      formData.append('receiverId', receiver._id);
      formData.append('receiverType', receiver.type);
      formData.append('text', text);
      
      if (processedFile) {
        console.log('Appending file:', processedFile.name, processedFile.size, processedFile.type);
        formData.append('file', processedFile);
      }

      console.log('FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/messages`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        },
      );

      console.log('Response status:', res.status);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.log('Send message error:', errorData);
        throw new Error(`Failed to send message: ${JSON.stringify(errorData)}`);
      }

      const data = await res.json();
      console.log('Send message success:', data);
      return data;
    },
    onSuccess: (_data, variables) => {
      console.log('Message sent successfully');
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
    onError: (error) => {
      console.log('Send message mutation error:', error);
    },
  });
}