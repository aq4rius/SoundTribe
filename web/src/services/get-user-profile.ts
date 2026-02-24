import api from '@/lib/api';
import type { IUser } from '@/types';

export async function getUserProfile(token: string): Promise<IUser> {
  const res = await api.get('/users/profile', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}
