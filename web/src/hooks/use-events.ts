import { useQuery } from '@tanstack/react-query';
import type { EventFilters, IEventPosting } from '@/types';
import { env } from '@/lib/env';

export function useEvents(filters: EventFilters) {
  return useQuery<IEventPosting[]>({
    queryKey: ['events', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.search) params.append('searchTerm', filters.search); // Backend expects 'searchTerm'
      const res = await fetch(
        `${env.NEXT_PUBLIC_API_URL}/api/event-postings?${params.toString()}`,
      );
      if (!res.ok) throw new Error('Failed to fetch events');
      const data = await res.json();
      // Defensive: normalise both array and { data: [] } response shapes
      const events: IEventPosting[] = Array.isArray(data)
        ? data
        : Array.isArray(data.data)
          ? data.data
          : [];
      return events.map((event) => ({
        ...event,
        title: event.title || 'Untitled',
        description: event.description || '',
        location: event.location || '',
        eventDate: event.eventDate || '',
      }));
    },
  });
}
