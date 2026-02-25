import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { INotification } from '@/types';
import { env } from '@/lib/env';

// Fetch notifications for the current user
// TRANSITIONAL: auth header removed until Phase 3
export function useNotifications(token?: string) {
  return useQuery<INotification[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/notifications`, {
        headers: {},
      });
      if (!res.ok) throw new Error('Failed to fetch notifications');
      return res.json();
    },
    enabled: !!token,
  });
}

// Mark a notification as read
export function useMarkNotificationRead(token?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/notifications/${id}`, {
        method: 'PUT',
        headers: {},
      });
      if (!res.ok) throw new Error('Failed to mark notification as read');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

// Delete a notification
export function useDeleteNotification(token?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/notifications/${id}`, {
        method: 'DELETE',
        headers: {},
      });
      if (!res.ok) throw new Error('Failed to delete notification');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
