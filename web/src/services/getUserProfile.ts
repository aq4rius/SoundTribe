import axios from 'axios';

export async function getUserProfile(token: string) {
  const res = await axios.get('/api/users/profile', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}
