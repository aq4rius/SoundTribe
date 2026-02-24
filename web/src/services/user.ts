import api from '@/lib/api';

/**
 * Onboarding service — uses centralized API client with built-in 401 handling.
 */

export async function getOnboardingState(token: string) {
  const res = await api.get('/users/onboarding', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function updateOnboardingState(token: string, data: Record<string, unknown>) {
  const res = await api.patch('/users/onboarding', data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}
