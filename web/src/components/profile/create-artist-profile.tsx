// CreateArtistProfile for Next.js app
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { createOrUpdateArtistProfileAction } from '@/actions/artist-profiles';

function SuccessModal({ show, onClose }: { show: boolean; onClose: () => void }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-8 max-w-sm w-full text-center border border-fuchsia-400">
        <h2 className="text-2xl font-bold mb-2 text-fuchsia-700 dark:text-fuchsia-300">Success!</h2>
        <p className="mb-4 text-zinc-700 dark:text-zinc-200">
          Your artist profile was created successfully.
        </p>
        <button className="btn btn-primary" onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
}

export default function CreateArtistProfile() {
  const { data: session } = useSession();
  const user = session?.user;
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
  const [showSuccess, setShowSuccess] = useState(false);

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
      formData.append('stageName', form.stageName);
      formData.append('biography', form.biography);
      // Split comma-separated instruments into array entries
      form.instruments
        .split(',')
        .map((i) => i.trim())
        .filter(Boolean)
        .forEach((inst) => formData.append('instruments', inst));
      formData.append('yearsOfExperience', String(form.yearsOfExperience));
      formData.append('location', form.location);
      if (form.websiteUrl) formData.append('websiteUrl', form.websiteUrl);
      const socialMediaLinks: Record<string, string> = {};
      if (form.facebook) socialMediaLinks.facebook = form.facebook;
      if (form.instagram) socialMediaLinks.instagram = form.instagram;
      if (form.twitter) socialMediaLinks.twitter = form.twitter;
      if (form.youtube) socialMediaLinks.youtube = form.youtube;
      if (Object.keys(socialMediaLinks).length > 0) {
        formData.append('socialMediaLinks', JSON.stringify(socialMediaLinks));
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
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Artist profile creation failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
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
        <div className="flex gap-2 justify-end">
          <button type="button" className="btn btn-ghost" onClick={() => router.push('/dashboard')}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary w-full" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Create Artist Profile'}
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
