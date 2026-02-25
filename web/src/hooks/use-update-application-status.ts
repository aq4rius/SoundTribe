import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ApplicationStatus } from '@/types';
import { env } from '@/lib/env';

// TRANSITIONAL: auth header removed until Phase 3
export function useUpdateApplicationStatus(token?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      applicationId,
      status,
    }: {
      applicationId: string;
      status: ApplicationStatus;
    }) => {
      const res = await fetch(
        `${env.NEXT_PUBLIC_API_URL}/api/applications/${applicationId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status }),
        },
      );
      if (!res.ok)
        throw new Error((await res.json()).message || 'Failed to update application status');
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });
}
