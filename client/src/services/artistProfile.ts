import api from './api';

export const createArtistProfile = async (artistProfileData: any) => {
  const response = await api.post('/artist-profiles', artistProfileData);
  return response.data;
};
