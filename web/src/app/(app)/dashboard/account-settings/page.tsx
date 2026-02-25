'use client';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { updateAccountSettingsAction } from '@/actions/users';
import { useRouter } from 'next/navigation';

interface Preferences {
  genres?: string[];
  instruments?: string[];
  influences?: string[];
  eventTypes?: string[];
  [key: string]: unknown;
}

interface LocationDetail {
  city?: string;
  region?: string;
  willingToTravel?: number;
  [key: string]: unknown;
}

interface AccountForm {
  firstName: string;
  lastName: string;
  location: string;
  bio: string;
  preferences: Preferences;
  locationDetails: LocationDetail;
  notificationPreferences: Record<string, unknown>;
  privacySettings: Record<string, unknown>;
}

export default function AccountSettingsPage() {
  const { data: session } = useSession();
  const user = session?.user as Record<string, unknown> | undefined;
  const router = useRouter();
  const [form, setForm] = useState<AccountForm>({
    firstName: (user?.firstName as string) || '',
    lastName: (user?.lastName as string) || '',
    location: (user?.location as string) || '',
    bio: (user?.bio as string) || '',
    preferences: { ...(user?.preferences as Preferences) },
    locationDetails: { ...(user?.locationDetails as LocationDetail) },
    notificationPreferences: { ...(user?.notificationPreferences as Record<string, unknown>) },
    privacySettings: { ...(user?.privacySettings as Record<string, unknown>) },
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!user) return <div className="p-8">Not logged in.</div>;

  const handleChange = (field: keyof AccountForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };
  const handlePrefChange = (field: string, value: string | string[] | boolean | number) => {
    setForm((prev) => ({ ...prev, preferences: { ...prev.preferences, [field]: value } }));
  };
  const handleLocChange = (field: string, value: string | number) => {
    setForm((prev) => ({
      ...prev,
      locationDetails: { ...prev.locationDetails, [field]: value },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const formData = new FormData();
      formData.append('firstName', form.firstName);
      formData.append('lastName', form.lastName);
      formData.append('location', form.location);
      formData.append('bio', form.bio);
      formData.append('preferences', JSON.stringify(form.preferences));
      formData.append('locationDetails', JSON.stringify(form.locationDetails));
      formData.append('notificationPreferences', JSON.stringify(form.notificationPreferences));
      formData.append('privacySettings', JSON.stringify(form.privacySettings));
      const result = await updateAccountSettingsAction(formData);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setSuccess(true);
    } catch {
      setError('Failed to update settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-8 mt-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Account Settings</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold mb-1 text-gray-800">First Name</label>
          <input
            type="text"
            className="w-full border rounded px-2 py-1 text-gray-900 bg-gray-50"
            value={form.firstName || ''}
            onChange={(e) => handleChange('firstName', e.target.value)}
            placeholder="First Name"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1 text-gray-800">Last Name</label>
          <input
            type="text"
            className="w-full border rounded px-2 py-1 text-gray-900 bg-gray-50"
            value={form.lastName || ''}
            onChange={(e) => handleChange('lastName', e.target.value)}
            placeholder="Last Name"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1 text-gray-800">Location</label>
          <input
            type="text"
            className="w-full border rounded px-2 py-1 text-gray-900 bg-gray-50"
            value={form.location || ''}
            onChange={(e) => handleChange('location', e.target.value)}
            placeholder="Location"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1 text-gray-800">Bio</label>
          <textarea
            className="w-full border rounded px-2 py-1 text-gray-900 bg-gray-50"
            value={form.bio || ''}
            onChange={(e) => handleChange('bio', e.target.value)}
            placeholder="Bio"
            rows={3}
          />
        </div>
        <div>
          <label className="block font-semibold mb-1 text-gray-800">Genres</label>
          <input
            type="text"
            className="w-full border rounded px-2 py-1 text-gray-900 bg-gray-50"
            value={form.preferences?.genres?.join(', ') || ''}
            onChange={(e) =>
              handlePrefChange(
                'genres',
                e.target.value
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean),
              )
            }
            placeholder="e.g. Rock, Jazz"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1 text-gray-800">Instruments</label>
          <input
            type="text"
            className="w-full border rounded px-2 py-1 text-gray-900 bg-gray-50"
            value={form.preferences?.instruments?.join(', ') || ''}
            onChange={(e) =>
              handlePrefChange(
                'instruments',
                e.target.value
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean),
              )
            }
            placeholder="e.g. Guitar, Drums"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1 text-gray-800">Influences</label>
          <input
            type="text"
            className="w-full border rounded px-2 py-1 text-gray-900 bg-gray-50"
            value={form.preferences?.influences?.join(', ') || ''}
            onChange={(e) =>
              handlePrefChange(
                'influences',
                e.target.value
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean),
              )
            }
            placeholder="e.g. Radiohead, Daft Punk"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1 text-gray-800">Goals</label>
          <input
            type="text"
            className="w-full border rounded px-2 py-1 text-gray-900 bg-gray-50"
            value={form.preferences?.eventTypes?.join(', ') || ''}
            onChange={(e) =>
              handlePrefChange(
                'eventTypes',
                e.target.value
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean),
              )
            }
            placeholder="e.g. Gigs, Studio, Networking"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1 text-gray-800">City</label>
          <input
            type="text"
            className="w-full border rounded px-2 py-1 text-gray-900 bg-gray-50"
            value={form.locationDetails?.city || ''}
            onChange={(e) => handleLocChange('city', e.target.value)}
            placeholder="City"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1 text-gray-800">Region</label>
          <input
            type="text"
            className="w-full border rounded px-2 py-1 text-gray-900 bg-gray-50"
            value={form.locationDetails?.region || ''}
            onChange={(e) => handleLocChange('region', e.target.value)}
            placeholder="Region"
          />
        </div>
        <div>
          <label className="block font-semibold mb-1 text-gray-800">Willing to travel (km)</label>
          <input
            type="number"
            className="w-full border rounded px-2 py-1 text-gray-900 bg-gray-50"
            value={form.locationDetails?.willingToTravel || ''}
            onChange={(e) => handleLocChange('willingToTravel', Number(e.target.value))}
            min={0}
            max={1000}
          />
        </div>
        <div className="flex gap-4 mt-6">
          <button
            type="submit"
            className="px-6 py-2 rounded bg-indigo-500 text-white font-semibold"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            className="px-6 py-2 rounded bg-gray-200 text-gray-900"
            onClick={() => router.push('/dashboard')}
          >
            Cancel
          </button>
        </div>
        {error && <div className="text-red-500 mt-2">{error}</div>}
        {success && <div className="text-green-600 mt-2">Settings updated!</div>}
      </form>
    </div>
  );
}
