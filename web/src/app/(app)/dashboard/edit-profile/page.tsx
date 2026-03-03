'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { updateProfileAction, updateAccountSettingsAction, changePasswordAction } from '@/actions/users';
import AvatarUpload from '@/components/profile/avatar-upload';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, AlertTriangle } from 'lucide-react';

// ── Schemas ──────────────────────────────────────────────────────────────────

const profileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    confirmNewPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((d) => d.newPassword === d.confirmNewPassword, {
    message: "Passwords don't match",
    path: ['confirmNewPassword'],
  });

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

// ── Inline feedback helpers ───────────────────────────────────────────────────

function SuccessBanner({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-emerald-500/50 bg-emerald-500/10 p-3 text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
      <CheckCircle className="h-4 w-4 shrink-0" /> {message}
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
      {message}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function EditProfilePage() {
  const { data: session } = useSession();
  const user = session?.user as Record<string, unknown> | undefined;

  // ── Profile section ───────────────────────────────────────────────
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    setValue: setProfileValue,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { username: '', firstName: '', lastName: '', location: '', bio: '' },
  });

  useEffect(() => {
    if (user) {
      setProfileValue('username', (user.username as string) ?? '');
      setProfileValue('firstName', (user.firstName as string) ?? '');
      setProfileValue('lastName', (user.lastName as string) ?? '');
      setProfileValue('location', (user.location as string) ?? '');
      setProfileValue('bio', (user.bio as string) ?? '');
    }
  }, [user, setProfileValue]);

  const onProfileSubmit = async (data: ProfileFormValues) => {
    setProfileError(null);
    setProfileSuccess(false);
    setProfileLoading(true);
    try {
      const formData = new FormData();
      formData.append('username', data.username);
      formData.append('firstName', data.firstName ?? '');
      formData.append('lastName', data.lastName ?? '');
      formData.append('location', data.location ?? '');
      formData.append('bio', data.bio ?? '');
      const result = await updateProfileAction(formData);
      if (!result.success) { setProfileError(result.error); return; }
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (e) {
      setProfileError(e instanceof Error ? e.message : 'Profile update failed');
    } finally {
      setProfileLoading(false);
    }
  };

  // ── Preferences section ───────────────────────────────────────────
  const [prefsError, setPrefsError] = useState<string | null>(null);
  const [prefsSuccess, setPrefsSuccess] = useState(false);
  const [prefsLoading, setPrefsLoading] = useState(false);
  const [prefs, setPrefs] = useState({
    genres: '', instruments: '', influences: '', eventTypes: '',
    city: '', region: '', willingToTravel: '',
  });

  useEffect(() => {
    if (user) {
      const p = (user.preferences as Record<string, string[]> | undefined) ?? {};
      const loc = (user.locationDetails as Record<string, string | number> | undefined) ?? {};
      setPrefs({
        genres: (p.genres ?? []).join(', '),
        instruments: (p.instruments ?? []).join(', '),
        influences: (p.influences ?? []).join(', '),
        eventTypes: (p.eventTypes ?? []).join(', '),
        city: (loc.city as string) ?? '',
        region: (loc.region as string) ?? '',
        willingToTravel: loc.willingToTravel != null ? String(loc.willingToTravel) : '',
      });
    }
  }, [user]);

  const onPrefsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPrefsError(null);
    setPrefsSuccess(false);
    setPrefsLoading(true);
    try {
      const split = (v: string) => v.split(',').map((s) => s.trim()).filter(Boolean);
      const formData = new FormData();
      formData.append('preferences', JSON.stringify({
        genres: split(prefs.genres),
        instruments: split(prefs.instruments),
        influences: split(prefs.influences),
        eventTypes: split(prefs.eventTypes),
      }));
      formData.append('locationDetails', JSON.stringify({
        city: prefs.city,
        region: prefs.region,
        willingToTravel: prefs.willingToTravel ? Number(prefs.willingToTravel) : undefined,
      }));
      formData.append('notificationPreferences', JSON.stringify({}));
      formData.append('privacySettings', JSON.stringify({}));
      const result = await updateAccountSettingsAction(formData);
      if (!result.success) { setPrefsError(result.error); return; }
      setPrefsSuccess(true);
      setTimeout(() => setPrefsSuccess(false), 3000);
    } catch (e) {
      setPrefsError(e instanceof Error ? e.message : 'Failed to save preferences');
    } finally {
      setPrefsLoading(false);
    }
  };

  // ── Password section ──────────────────────────────────────────────
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  const {
    register: registerPw,
    handleSubmit: handlePwSubmit,
    reset: resetPw,
    formState: { errors: pwErrors },
  } = useForm<PasswordFormValues>({ resolver: zodResolver(passwordSchema) });

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    setPwError(null);
    setPwSuccess(false);
    setPwLoading(true);
    try {
      const formData = new FormData();
      formData.append('currentPassword', data.currentPassword);
      formData.append('newPassword', data.newPassword);
      formData.append('confirmNewPassword', data.confirmNewPassword);
      const result = await changePasswordAction(formData);
      if (!result.success) { setPwError(result.error); return; }
      setPwSuccess(true);
      resetPw();
      setTimeout(() => setPwSuccess(false), 3000);
    } catch (e) {
      setPwError(e instanceof Error ? e.message : 'Password change failed');
    } finally {
      setPwLoading(false);
    }
  };

  if (!user) return <div className="p-8 text-muted-foreground">Not logged in.</div>;

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Account Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your profile, preferences and security.</p>
        </div>

        {/* ── SECTION 1: Profile ── */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Update your public profile information and avatar.</CardDescription>
          </CardHeader>
          <CardContent>
            {profileError && <ErrorBanner message={profileError} />}
            {profileSuccess && <SuccessBanner message="Profile updated!" />}
            <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4 mt-4">
              <div className="flex justify-center mb-6">
                <AvatarUpload
                  currentImage={(user.profileImage as string | null) ?? null}
                  username={(user.username as string) ?? ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" {...registerProfile('username')} />
                {profileErrors.username && <p className="text-sm text-destructive">{profileErrors.username.message}</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" {...registerProfile('firstName')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" {...registerProfile('lastName')} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" {...registerProfile('location')} placeholder="e.g. London, UK" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" {...registerProfile('bio')} rows={3} placeholder="Tell us about yourself" />
              </div>
              <Button type="submit" disabled={profileLoading}>
                {profileLoading ? 'Saving...' : 'Save Profile'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Separator />

        {/* ── SECTION 2: Preferences ── */}
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Your music preferences and location details.</CardDescription>
          </CardHeader>
          <CardContent>
            {prefsError && <ErrorBanner message={prefsError} />}
            {prefsSuccess && <SuccessBanner message="Preferences saved!" />}
            <form onSubmit={onPrefsSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pGenres">Genres</Label>
                  <Input id="pGenres" value={prefs.genres} onChange={(e) => setPrefs((p) => ({ ...p, genres: e.target.value }))} placeholder="e.g. Rock, Jazz" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pInstruments">Instruments</Label>
                  <Input id="pInstruments" value={prefs.instruments} onChange={(e) => setPrefs((p) => ({ ...p, instruments: e.target.value }))} placeholder="e.g. Guitar, Drums" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pInfluences">Influences</Label>
                  <Input id="pInfluences" value={prefs.influences} onChange={(e) => setPrefs((p) => ({ ...p, influences: e.target.value }))} placeholder="e.g. Radiohead, Daft Punk" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pEventTypes">Goals / Event Types</Label>
                  <Input id="pEventTypes" value={prefs.eventTypes} onChange={(e) => setPrefs((p) => ({ ...p, eventTypes: e.target.value }))} placeholder="e.g. Gigs, Studio" />
                </div>
              </div>
              <Separator />
              <p className="text-sm font-medium text-foreground">Location Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" value={prefs.city} onChange={(e) => setPrefs((p) => ({ ...p, city: e.target.value }))} placeholder="City" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">Region</Label>
                  <Input id="region" value={prefs.region} onChange={(e) => setPrefs((p) => ({ ...p, region: e.target.value }))} placeholder="Region" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="willingToTravel">Travel range (km)</Label>
                  <Input id="willingToTravel" type="number" min={0} max={1000} value={prefs.willingToTravel} onChange={(e) => setPrefs((p) => ({ ...p, willingToTravel: e.target.value }))} />
                </div>
              </div>
              <Button type="submit" disabled={prefsLoading}>
                {prefsLoading ? 'Saving...' : 'Save Preferences'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Separator />

        {/* ── SECTION 3: Account & Security ── */}
        <Card>
          <CardHeader>
            <CardTitle>Account &amp; Security</CardTitle>
            <CardDescription>Change your password.</CardDescription>
          </CardHeader>
          <CardContent>
            {pwError && <ErrorBanner message={pwError} />}
            {pwSuccess && <SuccessBanner message="Password changed successfully!" />}
            <form onSubmit={handlePwSubmit(onPasswordSubmit)} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" {...registerPw('currentPassword')} />
                {pwErrors.currentPassword && <p className="text-sm text-destructive">{pwErrors.currentPassword.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input id="newPassword" type="password" {...registerPw('newPassword')} />
                {pwErrors.newPassword && <p className="text-sm text-destructive">{pwErrors.newPassword.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                <Input id="confirmNewPassword" type="password" {...registerPw('confirmNewPassword')} />
                {pwErrors.confirmNewPassword && <p className="text-sm text-destructive">{pwErrors.confirmNewPassword.message}</p>}
              </div>
              <Button type="submit" disabled={pwLoading}>
                {pwLoading ? 'Changing...' : 'Change Password'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Separator />

        {/* ── SECTION 4: Danger Zone ── */}
        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" /> Danger Zone
            </CardTitle>
            <CardDescription>Irreversible actions. Proceed with caution.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              <div>
                <p className="font-medium text-sm">Delete Account</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Permanently delete your account and all associated data.
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                type="button"
                onClick={() => {
                  if (window.confirm('Are you absolutely sure? This action cannot be undone.')) {
                    alert('Please contact support@soundtribe.app to delete your account.');
                  }
                }}
              >
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
