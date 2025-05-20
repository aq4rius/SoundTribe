// CreateArtistProfile for Next.js app (after profile setup)
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function CreateArtistProfile() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    stageName: '',
    biography: '',
    instruments: '',
    yearsOfExperience: 0,
    location: '',
    websiteUrl: '',
    facebook: '',
    instagram: '',
    twitter: '',
    youtube: '',
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
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/artist-profiles`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ ...form, user: user.id }),
        },
      );
      if (!res.ok) {
        const err = await res.json();
        setError(err.message || 'Artist profile creation failed');
        return;
      }
      router.push('/dashboard');
    } catch (e: any) {
      setError(e.message || 'Artist profile creation failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto bg-black/70 p-8 rounded-xl shadow space-y-6 mt-8"
    >
      <h2 className="text-2xl font-bold text-center mb-2">Create Artist Profile</h2>
      {error && <div className="bg-red-500/20 text-red-400 p-2 rounded text-center">{error}</div>}
      <div>
        <label className="block mb-1">Stage Name</label>
        <input
          name="stageName"
          value={form.stageName}
          onChange={handleChange}
          className="input input-bordered w-full"
        />
      </div>
      <div>
        <label className="block mb-1">Biography</label>
        <textarea
          name="biography"
          value={form.biography}
          onChange={handleChange}
          className="input input-bordered w-full"
        />
      </div>
      <div>
        <label className="block mb-1">Instruments (comma separated)</label>
        <input
          name="instruments"
          value={form.instruments}
          onChange={handleChange}
          className="input input-bordered w-full"
        />
      </div>
      <div>
        <label className="block mb-1">Years of Experience</label>
        <input
          name="yearsOfExperience"
          type="number"
          value={form.yearsOfExperience}
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
        <label className="block mb-1">Website</label>
        <input
          name="websiteUrl"
          value={form.websiteUrl}
          onChange={handleChange}
          className="input input-bordered w-full"
        />
      </div>
      <div>
        <label className="block mb-1">Facebook</label>
        <input
          name="facebook"
          value={form.facebook}
          onChange={handleChange}
          className="input input-bordered w-full"
        />
      </div>
      <div>
        <label className="block mb-1">Instagram</label>
        <input
          name="instagram"
          value={form.instagram}
          onChange={handleChange}
          className="input input-bordered w-full"
        />
      </div>
      <div>
        <label className="block mb-1">Twitter</label>
        <input
          name="twitter"
          value={form.twitter}
          onChange={handleChange}
          className="input input-bordered w-full"
        />
      </div>
      <div>
        <label className="block mb-1">YouTube</label>
        <input
          name="youtube"
          value={form.youtube}
          onChange={handleChange}
          className="input input-bordered w-full"
        />
      </div>
      <button type="submit" className="btn btn-primary w-full" disabled={isLoading}>
        {isLoading ? 'Saving...' : 'Create Artist Profile'}
      </button>
    </form>
  );
}
