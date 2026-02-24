import api from '@/lib/api';
import type { IGenre } from '@/types/genre';

export const getAllGenres = async (): Promise<IGenre[]> => {
  const response = await api.get('/genres');
  return response.data;
};
