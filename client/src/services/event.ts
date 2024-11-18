import api from './api';

export const createEvent = async (eventData: any) => {
  const response = await api.post('/events', eventData);
  return response.data;
};

export const getEventById = async (eventId: string) => {
  const response = await api.get(`/events/${eventId}`);
  return response.data;
};

export const getUserEvents = async () => {
  const response = await api.get('/events/user');
  return response.data;
};

export const updateEvent = async (eventId: string, eventData: any) => {
  const response = await api.put(`/events/${eventId}`, eventData);
  return response.data;
};

export const deleteEvent = async (eventId: string) => {
  const response = await api.delete(`/events/${eventId}`);
  return response.data;
};

export const searchEvents = async (params: {
  genre?: string;
  instrument?: string;
  location?: string;
}) => {
  const response = await api.get('/events', { params });
  return response.data;
};
