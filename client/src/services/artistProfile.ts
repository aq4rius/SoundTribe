import api from './api';
import { ArtistProfile } from '../types';


export const createArtistProfile = async (artistProfileData: any) => {
  const response = await api.post('/artist-profiles', artistProfileData);
  return response.data;
};

export const getArtistProfileById = async (profileId: string) => {
  const response = await api.get(`/artist-profiles/${profileId}`);
  return response.data;
};


export const getUserArtistProfiles = async () => {
  const response = await api.get('/artist-profiles/user');
  return response.data;
};

export const deleteArtistProfile = async (profileId: string) => {
  const response = await api.delete(`/artist-profiles/${profileId}`);
  return response.data;
};

export const updateArtistProfile = async (profileId: string, profileData: Partial<ArtistProfile>) => {
  const response = await api.put(`/artist-profiles/${profileId}`, profileData);
  return response.data;
};
