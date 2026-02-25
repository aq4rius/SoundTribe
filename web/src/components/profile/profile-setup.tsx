// ProfileSetup for Next.js app (basic info step after registration)
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { updateProfileAction } from '@/actions/users';

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
      const formData = new FormData();
      formData.append('username', user?.name || '');
      formData.append('firstName', form.firstName);
      formData.append('lastName', form.lastName);
      formData.append('location', form.location);
      formData.append('bio', form.bio);
      const result = await updateProfileAction(formData);
      if (!result.success) {
        setError(result.error);
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
