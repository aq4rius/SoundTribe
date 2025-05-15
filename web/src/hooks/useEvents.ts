import { useQuery } from '@tanstack/react-query';

export function useEvents(filters: any) {
  return useQuery({
    queryKey: ['events', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.search) params.append('searchTerm', filters.search); // Backend expects 'searchTerm'
      // Add more filters as needed
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/event-postings?${params.toString()}`,
      );
      if (!res.ok) throw new Error('Failed to fetch events');
      const data = await res.json();
      // Defensive: ensure each event has required fields for display
      if (Array.isArray(data)) {
        return data.map((event: any) => ({
          title: event?.title || 'Untitled',
          description: event?.description || '',
          location: event?.location || '',
          eventDate: event?.eventDate || '',
          ...event,
        }));
      }
      if (Array.isArray(data.data)) {
        return data.data.map((event: any) => ({
          title: event?.title || 'Untitled',
          description: event?.description || '',
          location: event?.location || '',
          eventDate: event?.eventDate || '',
          ...event,
        }));
      }
      return [];
    },
  });
}
