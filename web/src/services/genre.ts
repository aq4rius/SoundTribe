import api from '@/services/api';

export const getAllGenres = async () => {
  const response = await api.get('/genres');
  return response.data;
};
