'use client';

// useAuth hook for Next.js app using Zustand authStore
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

export function useAuth() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  // Hydrate auth state from localStorage on mount (client only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const auth = localStorage.getItem('auth');
      if (auth) {
        try {
          const { user, token } = JSON.parse(auth);
          if (user && token)
            setAuth(
              {
                ...user,
                basicProfileCompleted: user.basicProfileCompleted ?? undefined,
                artistProfileCompleted: user.artistProfileCompleted ?? undefined,
              },
              token,
            );
        } catch {}
      }
    }
  }, [setAuth]);

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
