// EditArtistProfile for Next.js app
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function EditArtistProfile({ artistId }: { artistId: string }) {
  const { token } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      setIsLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/artist-profiles/${artistId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error('Failed to fetch artist profile');
        setProfile(await res.json());
      } catch (err: any) {
        setError(err.message || 'Error fetching artist profile');
      } finally {
        setIsLoading(false);
      }
    }
    if (artistId) fetchProfile();
  }, [artistId, token]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile((p: any) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/artist-profiles/${artistId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(profile),
        }
      );
      if (!res.ok) throw new Error('Failed to update artist profile');
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to update artist profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!profile) return null;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <input
        name="stageName"
        value={profile.stageName || ''}
        onChange={handleChange}
        className="input input-bordered w-full"
        placeholder="Stage Name"
      />
      <textarea
        name="biography"
        value={profile.biography || ''}
        onChange={handleChange}
        className="textarea textarea-bordered w-full"
        placeholder="Biography"
      />
      {/* Add more fields as needed */}
      <div className="flex gap-2 justify-end">
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
