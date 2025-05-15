// client/src/services/user.ts

import api from './api';

export const updateUserProfile = async (userData: any) => {
  const response = await api.put('/users/profile', userData);
  return response.data;
};

export const getUserProfile = async () => {
  const response = await api.get('/users/profile');
  return response.data;
};

export const createArtistProfile = async (artistData: any) => {
  const response = await api.post('/users/artist-profile', artistData);
  return response.data;
};

export const getArtistProfile = async () => {
  const response = await api.get('/users/artist-profile');
  return response.data;
};

export const deleteUserProfile = async () => {
  const response = await api.delete('/users/profile');
  return response.data;
};
