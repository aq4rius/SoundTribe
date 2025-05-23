import api from '@/services/api';

export const searchEventPostings = async (filters: any) => {
  const response = await api.get('/api/event-postings/search', { params: filters });
  return response.data;
};

export const getAllGenres = async () => {
  const response = await api.get('/api/genres');
  return response.data;
};
