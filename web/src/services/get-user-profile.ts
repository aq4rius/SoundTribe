import api from '@/lib/api';
import type { IUser } from '@/types';

// TRANSITIONAL: auth header removed until Phase 3
export async function getUserProfile(token: string): Promise<IUser> {
  const res = await api.get('/users/profile', {
    headers: {},
  });
  return res.data;
}
