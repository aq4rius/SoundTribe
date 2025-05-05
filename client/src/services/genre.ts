// client/src/services/genre.ts

import api from './api';

export const getAllGenres = async () => {
  const response = await api.get('/genres');
  return response.data;
};
