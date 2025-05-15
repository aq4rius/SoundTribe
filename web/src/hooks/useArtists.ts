import { useQuery } from '@tanstack/react-query';

export function useArtists(filters: any) {
  return useQuery({
    queryKey: ['artists', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      // Add more filters as needed
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/artist-profiles?${params.toString()}`,
      );
      if (!res.ok) throw new Error('Failed to fetch artists');
      const data = await res.json();
      // Defensive: ensure each artist has a stageName for display
      if (Array.isArray(data)) {
        return data.map((artist: any) => ({
          stageName: artist?.stageName || 'Unknown',
          profileImage: artist?.profileImage || '',
          biography: artist?.biography || '',
          location: artist?.location || '',
          ...artist,
        }));
      }
      if (Array.isArray(data.data)) {
        return data.data.map((artist: any) => ({
          stageName: artist?.stageName || 'Unknown',
          profileImage: artist?.profileImage || '',
          biography: artist?.biography || '',
          location: artist?.location || '',
          ...artist,
        }));
      }
      return [];
    },
  });
}
