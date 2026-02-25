import { useQuery } from '@tanstack/react-query';
import type { ArtistFilters, IArtistProfile } from '@/types';
import type { PaginatedResponse } from '@/types/api';
import { env } from '@/lib/env';

export function useArtists(filters: ArtistFilters, page: number = 1, limit: number = 9) {
  return useQuery<PaginatedResponse<IArtistProfile>>({
    queryKey: ['artists', filters, page, limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.search) params.append('searchTerm', filters.search);
      if (filters?.genres && filters.genres.length > 0)
        params.append('selectedGenres', filters.genres.join(','));
      if (filters?.location) params.append('location', filters.location);
      if (filters?.instruments) params.append('instruments', filters.instruments);
      if (filters?.experienceMin) params.append('experienceMin', filters.experienceMin);
      if (filters?.rateMin) params.append('rateMin', filters.rateMin);
      if (filters?.rateMax) params.append('rateMax', filters.rateMax);
      params.append('page', String(page));
      params.append('limit', String(limit));
      const res = await fetch(
        `${env.NEXT_PUBLIC_API_URL}/api/artist-profiles/search?${params.toString()}`,
      );
      if (!res.ok) throw new Error('Failed to fetch artists');
      return res.json();
    },
  });
}
