import api from '@/lib/api';
import type { EventFilters, IEventPosting } from '@/types';
import type { IGenre } from '@/types/genre';

export const searchEventPostings = async (
  filters: EventFilters,
): Promise<{ data: IEventPosting[]; totalPages: number }> => {
  const response = await api.get('/event-postings/search', { params: filters });
  return response.data;
};

export const getAllGenres = async (): Promise<IGenre[]> => {
  const response = await api.get('/genres');
  return response.data;
};
