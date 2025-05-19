// ProfileSetup for Next.js app (basic info step after registration)
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function ProfileSetup() {
  const { user, setAuth } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    location: '',
    bio: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!user) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      // Get token from localStorage or Zustand
      let token = '';
      if (typeof window !== 'undefined') {
        const auth = localStorage.getItem('auth');
        if (auth) {
          try {
            token = JSON.parse(auth).token;
          } catch {}
        }
      }
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/profile`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ ...form, basicProfileCompleted: true }),
          credentials: 'include',
        },
      );
      if (!res.ok) {
        const err = await res.json();
        setError(err.message || 'Profile update failed');
        return;
      }
      const updated = await res.json();
      setAuth(
        updated,
        localStorage.getItem('auth') ? JSON.parse(localStorage.getItem('auth')!).token : '',
      );
      router.push('/dashboard');
    } catch (e: any) {
      setError(e.message || 'Profile update failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto bg-black/70 p-8 rounded-xl shadow space-y-6 mt-8"
    >
      <h2 className="text-2xl font-bold text-center mb-2">Complete Your Profile</h2>
      {error && <div className="bg-red-500/20 text-red-400 p-2 rounded text-center">{error}</div>}
      <div>
        <label className="block mb-1">First Name</label>
        <input
          name="firstName"
          value={form.firstName}
          onChange={handleChange}
          className="input input-bordered w-full"
        />
      </div>
      <div>
        <label className="block mb-1">Last Name</label>
        <input
          name="lastName"
          value={form.lastName}
          onChange={handleChange}
          className="input input-bordered w-full"
        />
      </div>
      <div>
        <label className="block mb-1">Location</label>
        <input
          name="location"
          value={form.location}
          onChange={handleChange}
          className="input input-bordered w-full"
        />
      </div>
      <div>
        <label className="block mb-1">Bio</label>
        <textarea
          name="bio"
          value={form.bio}
          onChange={handleChange}
          className="input input-bordered w-full"
        />
      </div>
      <button type="submit" className="btn btn-primary w-full" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Complete Profile'}
      </button>
    </form>
  );
}
