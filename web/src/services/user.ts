import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

// Helper to handle 401 and clear session
async function handleAuthApiCall(promise: Promise<any>) {
  try {
    return await promise;
  } catch (err: any) {
    if (err.response && err.response.status === 401) {
      // Clear auth state and localStorage
      useAuthStore.getState().clearAuth();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth');
        window.location.href = '/auth/login';
      }
      throw new Error('Session expired. Please log in again.');
    }
    throw err;
  }
}

export async function getOnboardingState(token: string) {
  return handleAuthApiCall(
    axios.get('/api/users/onboarding', {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => res.data)
  );
}

export async function updateOnboardingState(token: string, data: any) {
  return handleAuthApiCall(
    axios.patch('/api/users/onboarding', data, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => res.data)
  );
}
