'use client';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { updateAccountSettingsAction } from '@/actions/users';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CheckCircle } from 'lucide-react';

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

  if (!user) return <div className="p-8 text-muted-foreground">Not logged in.</div>;

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
    <div className="min-h-screen bg-background py-12 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>Manage your personal information and preferences.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ── Personal Info ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" value={form.firstName || ''} onChange={(e) => handleChange('firstName', e.target.value)} placeholder="First Name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" value={form.lastName || ''} onChange={(e) => handleChange('lastName', e.target.value)} placeholder="Last Name" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" value={form.location || ''} onChange={(e) => handleChange('location', e.target.value)} placeholder="Location" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" value={form.bio || ''} onChange={(e) => handleChange('bio', e.target.value)} placeholder="Tell us about yourself" rows={3} />
            </div>

            <Separator />

            {/* ── Preferences ── */}
            <h3 className="text-lg font-semibold">Preferences</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="genres">Genres</Label>
                <Input id="genres" value={form.preferences?.genres?.join(', ') || ''} onChange={(e) => handlePrefChange('genres', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))} placeholder="e.g. Rock, Jazz" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instruments">Instruments</Label>
                <Input id="instruments" value={form.preferences?.instruments?.join(', ') || ''} onChange={(e) => handlePrefChange('instruments', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))} placeholder="e.g. Guitar, Drums" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="influences">Influences</Label>
                <Input id="influences" value={form.preferences?.influences?.join(', ') || ''} onChange={(e) => handlePrefChange('influences', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))} placeholder="e.g. Radiohead, Daft Punk" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="goals">Goals</Label>
                <Input id="goals" value={form.preferences?.eventTypes?.join(', ') || ''} onChange={(e) => handlePrefChange('eventTypes', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))} placeholder="e.g. Gigs, Studio" />
              </div>
            </div>

            <Separator />

            {/* ── Location Details ── */}
            <h3 className="text-lg font-semibold">Location Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" value={form.locationDetails?.city || ''} onChange={(e) => handleLocChange('city', e.target.value)} placeholder="City" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Input id="region" value={form.locationDetails?.region || ''} onChange={(e) => handleLocChange('region', e.target.value)} placeholder="Region" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="travel">Willing to travel (km)</Label>
                <Input id="travel" type="number" value={form.locationDetails?.willingToTravel || ''} onChange={(e) => handleLocChange('willingToTravel', Number(e.target.value))} min={0} max={1000} />
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
            )}
            {success && (
              <div className="rounded-lg border border-emerald-500/50 bg-emerald-500/10 p-3 text-sm text-emerald-500 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" /> Settings updated!
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
              <Button type="button" variant="outline" onClick={() => router.push('/dashboard')}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
