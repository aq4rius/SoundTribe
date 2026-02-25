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
 * - Cookies sent automatically via withCredentials (httpOnly session cookie)
 * - 401 interceptor: signs out via NextAuth and redirects to login
 */

import axios from 'axios';
import { signOut } from 'next-auth/react';
import { env } from '@/lib/env';

const api = axios.create({
  baseURL: `${env.NEXT_PUBLIC_API_URL}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ---------------------------------------------------------------------------
// Response interceptor — handle 401
// ---------------------------------------------------------------------------
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      typeof window !== 'undefined'
    ) {
      await signOut({ redirect: false });
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  },
);

export default api;
