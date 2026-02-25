// ProfileSetup for Next.js app (basic info step after registration)
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { env } from '@/lib/env';

export default function ProfileSetup() {
  const { data: session } = useSession();
  const user = session?.user;
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
      // TRANSITIONAL: Express API call will not work without token until Phase 3
      const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...form }),
        credentials: 'include',
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.message || 'Profile update failed');
        return;
      }
      router.push('/dashboard');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Profile update failed');
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
