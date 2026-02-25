// client/src/services/api.ts

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle auth errors globally
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Optionally, clear token and redirect to login or dispatch a global event
      localStorage.removeItem('token');
      window.dispatchEvent(
        new CustomEvent('authError', {
          detail: error.response.data?.message || 'Authentication error',
        }),
      );
    }
    // Optionally, dispatch a global error event for other errors
    window.dispatchEvent(
      new CustomEvent('apiError', { detail: error.response?.data?.message || error.message }),
    );
    return Promise.reject(error);
  },
);

// Fetch artist profiles and events owned by the current user
export async function getMyProfilesAndEvents() {
  // You may need to adjust endpoints based on your backend
  const [profilesRes, eventsRes] = await Promise.all([
    api.get('/artist-profiles/my'),
    api.get('/event-postings/user'),
  ]);
  // Use stageName for artist profiles
  const profiles = (profilesRes.data || []).map((p: any) => ({
    _id: p._id,
    name: p.stageName,
    type: 'ArtistProfile',
  }));
  const events = (eventsRes.data || []).map((e: any) => ({
    _id: e._id,
    name: e.title,
    type: 'Event',
  }));
  return [...profiles, ...events];
}

// Fetch available chat targets (all artist profiles and events except those owned by the user)
export async function getChatTargets(selectedSender: { _id: string; type: string }) {
  // Fetch all artist profiles and events, filter out those owned by the user
  const [profilesRes, eventsRes] = await Promise.all([
    api.get('/artist-profiles'),
    api.get('/event-postings'),
  ]);
  // Use .data.data for both artist profiles and events (pagination response)
  const profiles = (profilesRes.data?.data || []).map((p: any) => ({
    _id: p._id,
    name: p.stageName,
    type: 'ArtistProfile',
    owner: p.user,
  }));
  const events = (eventsRes.data?.data || []).map((e: any) => ({
    _id: e._id,
    name: e.title,
    type: 'Event',
    owner: e.owner,
  }));
  // Remove the sender's own entities
  return [...profiles, ...events].filter((ent) => ent._id !== selectedSender._id);
}

// Fetch messages between two entities, with optional pagination
export async function getMessages(
  sender: { _id: string; type: string },
  receiver: { _id: string; type: string },
  page?: number,
  limit?: number,
) {
  const token = localStorage.getItem('token');
  const params = new URLSearchParams({
    senderId: sender._id,
    senderType: sender.type,
    receiverId: receiver._id,
    receiverType: receiver.type,
  });
  if (page) params.append('page', String(page));
  if (limit) params.append('limit', String(limit));
  const res = await fetch(`/api/messages/convo?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to fetch messages');
  return await res.json();
}

// Send a message with optional file attachment
export async function sendMessage(
  sender: { _id: string; type: string },
  receiver: { _id: string; type: string },
  text: string,
  file?: File | null,
) {
  const formData = new FormData();
  formData.append('senderId', sender._id);
  formData.append('senderType', sender.type);
  formData.append('receiverId', receiver._id);
  formData.append('receiverType', receiver.type);
  formData.append('text', text);
  if (file) {
    formData.append('file', file);
  }
  const token = localStorage.getItem('token');
  const res = await fetch(`/api/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      // 'Content-Type' is set automatically by the browser for FormData
    },
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to send message');
  const data = await res.json();
  return data.message;
}

export default api;
