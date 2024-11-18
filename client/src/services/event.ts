import api from './api';

export const createEvent = async (eventData: any) => {
  const response = await api.post('/event-postings', eventData);
  return response.data;
};

export const getEventById = async (eventId: string) => {
  const response = await api.get(`/event-postings/${eventId}`);
  return response.data;
};

export const getUserEvents = async () => {
  const response = await api.get('/event-postings/user');
  return response.data;
};

export const updateEvent = async (eventId: string, eventData: any) => {
  const response = await api.put(`/event-postings/${eventId}`, eventData);
  return response.data;
};

export const deleteEvent = async (eventId: string) => {
  const response = await api.delete(`/event-postings/${eventId}`);
  return response.data;
};

export const searchEvents = async (params: {
  genre?: string;
  instrument?: string;
  location?: string;
}) => {
  const response = await api.get('/event-postings', { params });
  return response.data;
};
