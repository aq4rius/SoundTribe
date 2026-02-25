import api from '@/lib/api';

/**
 * Onboarding service — uses centralized API client with built-in 401 handling.
 */

// TRANSITIONAL: auth header removed until Phase 3
export async function getOnboardingState(token: string) {
  const res = await api.get('/users/onboarding', {
    headers: {},
  });
  return res.data;
}

export async function updateOnboardingState(token: string, data: Record<string, unknown>) {
  const res = await api.patch('/users/onboarding', data, {
    headers: {},
  });
  return res.data;
}
