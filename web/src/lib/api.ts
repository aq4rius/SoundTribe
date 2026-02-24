/**
 * Centralized Axios HTTP client.
 *
 * TRANSITIONAL: This module will be removed in Phase 3 when all data fetching
 * migrates to Server Components / Server Actions / Prisma queries.
 *
 * All API calls to the Express backend MUST go through this instance —
 * never import `axios` directly.
 *
 * Features:
 * - Base URL from validated env
 * - JWT auth header injection from Zustand store
 * - 401 interceptor: clears auth state and redirects to login
 */

import axios from 'axios';
import { env } from '@/lib/env';

const api = axios.create({
  baseURL: `${env.NEXT_PUBLIC_API_URL}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ---------------------------------------------------------------------------
// Request interceptor — attach JWT token
// ---------------------------------------------------------------------------
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    try {
      const auth = localStorage.getItem('auth');
      if (auth) {
        const { token } = JSON.parse(auth) as { token?: string };
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch {
      // localStorage unavailable or corrupt — proceed without token
    }
  }
  return config;
});

// ---------------------------------------------------------------------------
// Response interceptor — handle 401
// ---------------------------------------------------------------------------
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      typeof window !== 'undefined'
    ) {
      // Lazy import to avoid circular dependency with Zustand store
      import('@/store/auth-store').then(({ useAuthStore }) => {
        useAuthStore.getState().clearAuth();
      });
      localStorage.removeItem('auth');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  },
);

export default api;
