import { useQuery } from '@tanstack/react-query';

export interface Entity {
  _id: string;
  name: string;
  type: 'ArtistProfile' | 'Event';
}

// Add Message type for chat hooks
export interface Message {
  _id: string;
  sender: { id: string; type: string };
  receiver: { id: string; type: string };
  text?: string;
  attachment?: string;
  createdAt: string;
}

export function useMyEntities(token?: string) {
  return useQuery<Entity[]>({
    queryKey: ['my-entities'],
    queryFn: async () => {
      const [profilesRes, eventsRes] = await Promise.all([
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/artist-profiles/my`,
          { headers: { Authorization: `Bearer ${token}` } },
        ),
        fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/event-postings/user`,
          { headers: { Authorization: `Bearer ${token}` } },
        ),
      ]);
      if (!profilesRes.ok || !eventsRes.ok) throw new Error('Failed to fetch entities');
      const profilesJson = await profilesRes.json();
      const eventsJson = await eventsRes.json();
      const profiles = Array.isArray(profilesJson)
        ? profilesJson.map((p: any) => ({
            _id: p._id,
            name: p.stageName,
            type: 'ArtistProfile' as const,
            user: p.user,
          }))
        : [];
      const events = Array.isArray(eventsJson)
        ? eventsJson.map((e: any) => ({
            _id: e._id,
            name: e.title,
            type: 'Event' as const,
            owner: e.owner,
            postedBy: e.postedBy,
          }))
        : [];
      return [...profiles, ...events];
    },
    enabled: !!token,
  });
}
