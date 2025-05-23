// Zustand store for authentication state in Next.js app
import { createWithEqualityFn } from 'zustand/traditional'
import type { AuthUser } from '@/hooks/useAuth';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  setAuth: (user: AuthUser, token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = createWithEqualityFn<AuthState>((set) => ({
  user: null,
  token: null,
  setAuth: (user, token) => set({ user, token }),
  clearAuth: () => set({ user: null, token: null }),
}));
