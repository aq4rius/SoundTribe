// EditArtistProfile for Next.js app
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getAllGenres } from '@/services/genre';

export default function EditArtistProfile({ artistId }: { artistId: string }) {
  const { token } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [genreOptions, setGenreOptions] = useState<any[]>([]);

  useEffect(() => {
    async function fetchProfile() {
      setIsLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/artist-profiles/${artistId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error('Failed to fetch artist profile');
        const data = await res.json();
        // Ensure all fields are present for editing
        setProfile({
          ...data,
          websiteUrl: data.websiteUrl || '',
          socialMediaLinks: data.socialMediaLinks || {
            facebook: '',
            instagram: '',
            twitter: '',
            youtube: '',
            tiktok: '',
            other: ''
          },
          genres: Array.isArray(data.genres)
            ? data.genres.map((g: any) => (typeof g === 'string' ? g : g._id))
            : [],
        });
      } catch (err: any) {
        setError(err.message || 'Error fetching artist profile');
      } finally {
        setIsLoading(false);
      }
    }
    if (artistId) fetchProfile();
  }, [artistId, token]);

  // Fix: Ensure genres are populated as objects for display in edit form
  useEffect(() => {
    async function fetchGenres() {
      try {
        const genres = await getAllGenres();
        setGenreOptions(genres);
        // If profile is already loaded, patch genres to be objects for display
        setProfile((p: any) => {
          if (!p || !Array.isArray(p.genres)) return p;
          // If genres are just IDs, map to objects
          const genreIds = p.genres.map((g: any) => (typeof g === 'string' ? g : g._id));
          return {
            ...p,
            genres: genreIds,
          };
        });
      } catch {
        setGenreOptions([]);
      }
    }
    fetchGenres();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile((p: any) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleGenreChange = (genreId: string) => {
    setProfile((p: any) => {
      const genres = Array.isArray(p.genres) ? p.genres : [];
      return {
        ...p,
        genres: genres.includes(genreId)
          ? genres.filter((id: string) => id !== genreId)
          : [...genres, genreId],
      };
    });
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
      <div>
        <label className="block mb-1 font-medium">Stage Name</label>
        <input
          name="stageName"
          value={profile.stageName || ''}
          onChange={handleChange}
          className="input input-bordered w-full"
          placeholder="Stage Name"
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">Biography</label>
        <textarea
          name="biography"
          value={profile.biography || ''}
          onChange={handleChange}
          className="textarea textarea-bordered w-full"
          placeholder="Biography"
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">Location</label>
        <input
          name="location"
          value={profile.location || ''}
          onChange={handleChange}
          className="input input-bordered w-full"
          placeholder="Location"
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">Instruments (comma separated)</label>
        <input
          name="instruments"
          value={Array.isArray(profile.instruments) ? profile.instruments.join(', ') : profile.instruments || ''}
          onChange={e => setProfile((p: any) => ({ ...p, instruments: e.target.value.split(',').map((i: string) => i.trim()) }))}
          className="input input-bordered w-full"
          placeholder="Instruments (comma separated)"
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">Years of Experience</label>
        <input
          name="yearsOfExperience"
          type="number"
          value={profile.yearsOfExperience || ''}
          onChange={handleChange}
          className="input input-bordered w-full"
          placeholder="Years of Experience"
          min="0"
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">Website URL</label>
        <input
          name="websiteUrl"
          value={profile.websiteUrl || ''}
          onChange={handleChange}
          className="input input-bordered w-full"
          placeholder="Website URL"
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">Social Media Links</label>
        <div className="grid grid-cols-2 gap-2">
          {['facebook', 'instagram', 'twitter', 'youtube', 'tiktok', 'other'].map((platform) => (
            <input
              key={platform}
              name={platform}
              value={profile.socialMediaLinks?.[platform] || ''}
              onChange={e => setProfile((p: any) => ({
                ...p,
                socialMediaLinks: {
                  ...p.socialMediaLinks,
                  [platform]: e.target.value
                }
              }))}
              className="input input-bordered w-full"
              placeholder={platform.charAt(0).toUpperCase() + platform.slice(1)}
            />
          ))}
        </div>
      </div>
      <div>
        <label className="block mb-1 font-medium">Genres</label>
        <div className="flex flex-wrap gap-2">
          {genreOptions.map((genre) => (
            <label key={genre._id} className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={Array.isArray(profile.genres) && profile.genres.includes(genre._id)}
                onChange={() => handleGenreChange(genre._id)}
                className="checkbox checkbox-sm"
              />
              <span>{genre.name}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
