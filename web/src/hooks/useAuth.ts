'use client';

// useAuth hook for Next.js app using Zustand authStore
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { shallow } from 'zustand/shallow';

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
          const { user: storedUser, token: storedToken } = JSON.parse(auth);
          // Only set if different
          const userChanged = JSON.stringify(storedUser) !== JSON.stringify(user);
          const tokenChanged = storedToken !== token;
          if (storedUser && storedToken && (userChanged || tokenChanged)) {
            setAuth(
              {
                ...storedUser,
                basicProfileCompleted: storedUser.basicProfileCompleted ?? undefined,
                artistProfileCompleted: storedUser.artistProfileCompleted ?? undefined,
              },
              storedToken,
            );
          }
        } catch {}
      }
    }
  }, [setAuth, user, token]);

  return { user, token, setAuth, clearAuth };
}

// Extend Zustand user type for dashboard compatibility
export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: string;
  profileCompleted?: boolean;
  artistProfileCompleted?: boolean;
  firstName?: string;
  lastName?: string;
  location?: string;
  bio?: string;
}
