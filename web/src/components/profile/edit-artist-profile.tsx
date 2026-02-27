// EditArtistProfile for Next.js app
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getGenres } from '@/actions/genres';
import {
  getArtistProfileByIdAction,
  createOrUpdateArtistProfileAction,
} from '@/actions/artist-profiles';

interface Genre {
  id: string;
  name: string;
}

interface ProfileForm {
  stageName: string;
  biography: string;
  instruments: string[];
  yearsOfExperience: number;
  location: string;
  websiteUrl: string;
  spotifyTrackUrl: string;
  socialMediaLinks: Record<string, string>;
  genres: string[]; // genre IDs
}

function SuccessModal({ show, onClose }: { show: boolean; onClose: () => void }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-8 max-w-sm w-full text-center border border-fuchsia-400">
        <h2 className="text-2xl font-bold mb-2 text-fuchsia-700 dark:text-fuchsia-300">Success!</h2>
        <p className="mb-4 text-zinc-700 dark:text-zinc-200">
          Your artist profile was updated successfully.
        </p>
        <button className="btn btn-primary" onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
}

export default function EditArtistProfile({ artistId }: { artistId: string }) {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileForm | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [genreOptions, setGenreOptions] = useState<Genre[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [profileResult, genres] = await Promise.all([
          getArtistProfileByIdAction(artistId),
          getGenres(),
        ]);
        setGenreOptions(genres.map((g) => ({ id: g.id, name: g.name })));
        if (!profileResult.success) {
          setError(profileResult.error);
          return;
        }
        const data = profileResult.data;
        setProfile({
          stageName: data.stageName || '',
          biography: data.biography || '',
          instruments: Array.isArray(data.instruments) ? data.instruments : [],
          yearsOfExperience: data.yearsOfExperience || 0,
          location: data.location || '',
          websiteUrl: data.websiteUrl || '',
          spotifyTrackUrl: data.spotifyTrackUrl || '',
          socialMediaLinks:
            typeof data.socialMediaLinks === 'object' && data.socialMediaLinks
              ? (data.socialMediaLinks as Record<string, string>)
              : { instagram: '', youtube: '', facebook: '', twitter: '', soundcloud: '', tiktok: '' },
          genres: Array.isArray(data.genres)
            ? data.genres.map((g: { id: string }) => g.id)
            : [],
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching artist profile');
      } finally {
        setIsLoading(false);
      }
    }
    if (artistId) fetchData();
  }, [artistId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile((p) => (p ? { ...p, [e.target.name]: e.target.value } : p));
  };

  const handleGenreChange = (genreId: string) => {
    setProfile((p) => {
      if (!p) return p;
      const genres = Array.isArray(p.genres) ? p.genres : [];
      return {
        ...p,
        genres: genres.includes(genreId)
          ? genres.filter((id) => id !== genreId)
          : [...genres, genreId],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setError(null);
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('stageName', profile.stageName);
      formData.append('biography', profile.biography);
      profile.instruments.forEach((inst) => formData.append('instruments', inst));
      formData.append('yearsOfExperience', String(profile.yearsOfExperience));
      formData.append('location', profile.location);
      if (profile.websiteUrl) formData.append('websiteUrl', profile.websiteUrl);
      if (profile.spotifyTrackUrl) formData.append('spotifyTrackUrl', profile.spotifyTrackUrl);
      profile.genres.forEach((g) => formData.append('genres', g));
      if (Object.keys(profile.socialMediaLinks).length > 0) {
        formData.append('socialMediaLinks', JSON.stringify(profile.socialMediaLinks));
      }
      const result = await createOrUpdateArtistProfileAction(formData);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        router.push('/dashboard');
      }, 1400);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update artist profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!profile) return null;

  return (
    <>
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
            value={
              Array.isArray(profile.instruments)
                ? profile.instruments.join(', ')
                : profile.instruments || ''
            }
            onChange={(e) =>
              setProfile((p) =>
                p
                  ? { ...p, instruments: e.target.value.split(',').map((i: string) => i.trim()) }
                  : p,
              )
            }
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
          <label className="block mb-1 font-medium">Spotify Track (optional)</label>
          <input
            name="spotifyTrackUrl"
            value={profile.spotifyTrackUrl || ''}
            onChange={handleChange}
            className="input input-bordered w-full"
            placeholder="https://open.spotify.com/track/..."
          />
          <p className="text-xs text-muted-foreground mt-1">Paste a Spotify track URL to embed a preview on your profile</p>
        </div>
        <div className="space-y-3">
          <label className="text-sm font-semibold">Social Links <span className="text-muted-foreground font-normal">(optional)</span></label>
          {[
            { key: 'instagram', placeholder: 'https://instagram.com/yourprofile' },
            { key: 'youtube', placeholder: 'https://youtube.com/@yourchannel' },
            { key: 'soundcloud', placeholder: 'https://soundcloud.com/yourprofile' },
            { key: 'tiktok', placeholder: 'https://tiktok.com/@yourhandle' },
            { key: 'facebook', placeholder: 'https://facebook.com/yourprofile' },
            { key: 'twitter', placeholder: 'https://twitter.com/yourhandle' },
          ].map(({ key, placeholder }) => (
            <div key={key} className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-20 capitalize">{key}</span>
              <input
                type="url"
                placeholder={placeholder}
                value={profile.socialMediaLinks?.[key] ?? ''}
                onChange={(e) =>
                  setProfile((p) =>
                    p ? { ...p, socialMediaLinks: { ...p.socialMediaLinks, [key]: e.target.value } } : p
                  )
                }
                className="flex-1 rounded-md border border-input bg-transparent px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          ))}
        </div>
        <div>
          <label className="block mb-1 font-medium">Genres</label>
          <div className="flex flex-wrap gap-2">
            {genreOptions.map((genre) => (
              <label key={genre.id} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={Array.isArray(profile.genres) && profile.genres.includes(genre.id)}
                  onChange={() => handleGenreChange(genre.id)}
                  className="checkbox checkbox-sm"
                />
                <span>{genre.name}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button type="button" className="btn btn-ghost" onClick={() => router.push('/dashboard')}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
      <SuccessModal
        show={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          router.push('/dashboard');
        }}
      />
    </>
  );
}
