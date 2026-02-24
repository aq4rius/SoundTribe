'use client';

// useAuth hook for Next.js app using Zustand authStore
import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { shallow } from 'zustand/shallow';
import type { AuthUser } from '@/types';

// Re-export for backward compat — consumers should import from @/types
export type { AuthUser } from '@/types';

export function useAuth() {
  // Use shallow comparison to prevent unnecessary rerenders
  const { user, token, setAuth, clearAuth } = useAuthStore(
    (state) => ({
      user: state.user,
      token: state.token,
      setAuth: state.setAuth,
      clearAuth: state.clearAuth,
    }),
    shallow,
  );

  // Hydrate auth state from localStorage on mount (client only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const auth = localStorage.getItem('auth');
      if (auth) {
        try {
          const { user: storedUser, token: storedToken } = JSON.parse(auth) as {
            user?: AuthUser;
            token?: string;
          };
          // Only set if different
          const userChanged = JSON.stringify(storedUser) !== JSON.stringify(user);
          const tokenChanged = storedToken !== token;
          if (storedUser && storedToken && (userChanged || tokenChanged)) {
            setAuth(storedUser, storedToken);
          }
        } catch {
          // Corrupt localStorage — ignore
        }
      }
    }
  }, [setAuth, user, token]);

  return { user, token, setAuth, clearAuth };
}
