import { useQuery } from '@tanstack/react-query';
import type { ChatEntity } from '@/types';
import { env } from '@/lib/env';

// Re-export for backward compatibility — consumers should migrate to @/types
export type { ChatEntity as Entity } from '@/types';
export type { IMessage as Message } from '@/types';

export function useMyEntities(token?: string) {
  return useQuery<ChatEntity[]>({
    queryKey: ['my-entities'],
    queryFn: async () => {
      // TRANSITIONAL: auth header removed until Phase 3
      const [profilesRes, eventsRes] = await Promise.all([
        fetch(`${env.NEXT_PUBLIC_API_URL}/api/artist-profiles/my`, { headers: {} }),
        fetch(`${env.NEXT_PUBLIC_API_URL}/api/event-postings/user`, { headers: {} }),
      ]);
      if (!profilesRes.ok || !eventsRes.ok) throw new Error('Failed to fetch entities');
      const profilesJson = await profilesRes.json();
      const eventsJson = await eventsRes.json();
      const profiles: ChatEntity[] = Array.isArray(profilesJson)
        ? profilesJson.map((p: { _id: string; stageName: string }) => ({
            _id: p._id,
            name: p.stageName,
            type: 'ArtistProfile' as const,
          }))
        : [];
      const events: ChatEntity[] = Array.isArray(eventsJson)
        ? eventsJson.map((e: { _id: string; title: string }) => ({
            _id: e._id,
            name: e.title,
            type: 'Event' as const,
          }))
        : [];
      return [...profiles, ...events];
    },
    // TODO(phase-3): re-enable when this hook is replaced by a Server Action
    // Currently disabled — token removed in Phase 2 auth migration
    enabled: false,
  });
}
