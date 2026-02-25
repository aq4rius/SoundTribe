// client/src/services/application.ts

import api from './api';

export const submitApplication = async (applicationData: {
  eventPostingId: string;
  artistProfileId: string;
  coverLetter: string;
  proposedRate?: number;
  availability: Date[];
}) => {
  const response = await api.post('/applications', applicationData);
  return response.data;
};

export const getUserApplications = async () => {
  const response = await api.get('/applications/my-applications');
  return response.data;
};

export const getApplicationsForEvent = async (eventId: string) => {
  const response = await api.get(`/applications/event/${eventId}`);
  return response.data;
};

export const updateApplicationStatus = async (
  applicationId: string,
  status: 'accepted' | 'rejected',
) => {
  const response = await api.patch(`/applications/${applicationId}/status`, { status });
  return response.data;
};
