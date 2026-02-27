'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Plus, Loader2, CheckCircle } from 'lucide-react';
import { createOrUpdateArtistProfileAction } from '@/actions/artist-profiles';
import { getGenres } from '@/actions/genres';
import { createArtistProfileSchema, type CreateArtistProfileInput } from '@/validations/artist-profiles';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface GenreOption { id: string; name: string }

export default function CreateArtistProfile() {
  const { data: session } = useSession();
  const user = session?.user;
  const router = useRouter();

  const [genres, setGenres] = useState<GenreOption[]>([]);
  const [genresLoading, setGenresLoading] = useState(true);
  const [instrumentInput, setInstrumentInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateArtistProfileInput>({
    resolver: zodResolver(createArtistProfileSchema),
    defaultValues: {
      stageName: '',
      biography: '',
      genres: [],
      instruments: [],
      location: '',
      yearsOfExperience: 0,
      ratePerHour: null,
      websiteUrl: '',
      spotifyTrackUrl: '',
      socialMediaLinks: { facebook: '', instagram: '', twitter: '', youtube: '', tiktok: '', soundcloud: '' },
    },
  });

  const selectedGenres = watch('genres');
  const instruments = watch('instruments');

  useEffect(() => {
    getGenres()
      .then((data) => setGenres(data as GenreOption[]))
      .catch(() => setGenres([]))
      .finally(() => setGenresLoading(false));
  }, []);

  const toggleGenre = useCallback(
    (genreId: string) => {
      const current = selectedGenres || [];
      const next = current.includes(genreId)
        ? current.filter((id) => id !== genreId)
        : [...current, genreId];
      setValue('genres', next, { shouldValidate: true });
    },
    [selectedGenres, setValue],
  );

  const addInstrument = useCallback(() => {
    const trimmed = instrumentInput.trim();
    if (!trimmed) return;
    const current = instruments || [];
    if (!current.includes(trimmed)) {
      setValue('instruments', [...current, trimmed], { shouldValidate: true });
    }
    setInstrumentInput('');
  }, [instrumentInput, instruments, setValue]);

  const removeInstrument = useCallback(
    (inst: string) => {
      setValue('instruments', (instruments || []).filter((i) => i !== inst), { shouldValidate: true });
    },
    [instruments, setValue],
  );

  const handleInstrumentKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addInstrument();
    }
  };

  const onSubmit = async (data: CreateArtistProfileInput) => {
    setError(null);
    try {
      const formData = new FormData();
      formData.append('stageName', data.stageName);
      formData.append('biography', data.biography || '');
      data.genres.forEach((g) => formData.append('genres', g));
      data.instruments.forEach((i) => formData.append('instruments', i));
      formData.append('location', data.location);
      formData.append('yearsOfExperience', String(data.yearsOfExperience));
      if (data.ratePerHour != null) formData.append('ratePerHour', String(data.ratePerHour));
      if (data.websiteUrl) formData.append('websiteUrl', data.websiteUrl);
      if (data.spotifyTrackUrl) formData.append('spotifyTrackUrl', data.spotifyTrackUrl);
      if (data.socialMediaLinks) formData.append('socialMediaLinks', JSON.stringify(data.socialMediaLinks));

      const result = await createOrUpdateArtistProfileAction(formData);
      if (!result.success) { setError(result.error); return; }
      setShowSuccess(true);
      setTimeout(() => { router.push('/dashboard'); router.refresh(); }, 1400);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Artist profile creation failed');
    }
  };

  if (!user) return null;

  return (
    <>
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <Card className="max-w-sm w-full text-center">
            <CardContent className="pt-6">
              <CheckCircle className="mx-auto h-12 w-12 text-emerald-400 mb-4" />
              <h2 className="text-xl font-bold mb-2">Profile Created!</h2>
              <p className="text-muted-foreground">Redirecting to your dashboard...</p>
            </CardContent>
          </Card>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* ── Basic Info ── */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <p className="text-sm text-muted-foreground">Tell the world who you are</p>
          </div>
          <Separator />
          <div className="space-y-2">
            <Label htmlFor="stageName">Stage Name *</Label>
            <Input id="stageName" placeholder="e.g. DJ Nova" {...register('stageName')} />
            {errors.stageName && <p className="text-sm text-destructive">{errors.stageName.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="biography">Biography</Label>
            <Textarea id="biography" placeholder="Share your musical journey... (min 20 characters)" rows={4} {...register('biography')} />
            {errors.biography && <p className="text-sm text-destructive">{errors.biography.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location *</Label>
            <Input id="location" placeholder="e.g. Los Angeles, CA" {...register('location')} />
            {errors.location && <p className="text-sm text-destructive">{errors.location.message}</p>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="yearsOfExperience">Years of Experience</Label>
              <Input id="yearsOfExperience" type="number" min={0} max={50} {...register('yearsOfExperience', { valueAsNumber: true })} />
              {errors.yearsOfExperience && <p className="text-sm text-destructive">{errors.yearsOfExperience.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="ratePerHour">Hourly Rate ($)</Label>
              <Input id="ratePerHour" type="number" min={0} placeholder="Optional" {...register('ratePerHour', { valueAsNumber: true })} />
            </div>
          </div>
        </div>

        {/* ── Genres ── */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Genres *</h3>
            <p className="text-sm text-muted-foreground">Select at least one genre</p>
          </div>
          <Separator />
          {genresLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading genres...</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {genres.map((genre) => {
                const isSelected = selectedGenres?.includes(genre.id);
                return (
                  <Badge key={genre.id} variant={isSelected ? 'default' : 'outline'}
                    className={`cursor-pointer select-none transition-all ${isSelected ? 'bg-fuchsia-600 hover:bg-fuchsia-700 border-fuchsia-600' : 'hover:bg-accent'}`}
                    onClick={() => toggleGenre(genre.id)}>
                    {genre.name}
                    {isSelected && <X className="ml-1 h-3 w-3" />}
                  </Badge>
                );
              })}
            </div>
          )}
          {errors.genres && <p className="text-sm text-destructive">{errors.genres.message}</p>}
        </div>

        {/* ── Instruments ── */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Instruments *</h3>
            <p className="text-sm text-muted-foreground">Type an instrument and press Enter or comma to add</p>
          </div>
          <Separator />
          <div className="flex flex-wrap gap-2 min-h-[2rem]">
            {(instruments || []).map((inst) => (
              <Badge key={inst} variant="secondary" className="gap-1">
                {inst}
                <button type="button" onClick={() => removeInstrument(inst)} className="ml-0.5 hover:text-destructive transition-colors">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input placeholder="e.g. Guitar" value={instrumentInput} onChange={(e) => setInstrumentInput(e.target.value)} onKeyDown={handleInstrumentKeyDown} />
            <Button type="button" variant="outline" size="sm" onClick={addInstrument}><Plus className="h-4 w-4" /> Add</Button>
          </div>
          {errors.instruments && <p className="text-sm text-destructive">{errors.instruments.message}</p>}
        </div>

        {/* ── Links ── */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Links &amp; Socials</h3>
            <p className="text-sm text-muted-foreground">Optional — help people find you online</p>
          </div>
          <Separator />
          <div className="space-y-2">
            <Label htmlFor="websiteUrl">Website</Label>
            <Input id="websiteUrl" placeholder="https://yoursite.com" {...register('websiteUrl')} />
            {errors.websiteUrl && <p className="text-sm text-destructive">{errors.websiteUrl.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="spotifyTrackUrl">Spotify Track (optional)</Label>
            <Input id="spotifyTrackUrl" placeholder="https://open.spotify.com/track/..." {...register('spotifyTrackUrl')} />
            <p className="text-xs text-muted-foreground mt-1">Paste a Spotify track URL to embed a preview on your profile</p>
            {errors.spotifyTrackUrl && <p className="text-sm text-destructive">{errors.spotifyTrackUrl.message}</p>}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label htmlFor="facebook">Facebook</Label><Input id="facebook" placeholder="facebook.com/you" {...register('socialMediaLinks.facebook')} /></div>
            <div className="space-y-2"><Label htmlFor="instagram">Instagram</Label><Input id="instagram" placeholder="@yourhandle" {...register('socialMediaLinks.instagram')} /></div>
            <div className="space-y-2"><Label htmlFor="twitter">Twitter / X</Label><Input id="twitter" placeholder="@yourhandle" {...register('socialMediaLinks.twitter')} /></div>
            <div className="space-y-2"><Label htmlFor="youtube">YouTube</Label><Input id="youtube" placeholder="youtube.com/@you" {...register('socialMediaLinks.youtube')} /></div>
            <div className="space-y-2"><Label htmlFor="tiktok">TikTok</Label><Input id="tiktok" placeholder="https://tiktok.com/@yourhandle" {...register('socialMediaLinks.tiktok')} /></div>
            <div className="space-y-2"><Label htmlFor="soundcloud">SoundCloud</Label><Input id="soundcloud" placeholder="https://soundcloud.com/yourprofile" {...register('socialMediaLinks.soundcloud')} /></div>
          </div>
        </div>

        {/* ── Actions ── */}
        <Separator />
        <div className="flex flex-col sm:flex-row gap-3">
          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? (<><Loader2 className="h-4 w-4 animate-spin" /> Creating...</>) : 'Create Artist Profile'}
          </Button>
          <Button type="button" variant="ghost" onClick={() => router.push('/dashboard')}>Cancel</Button>
        </div>
      </form>
    </>
  );
}
