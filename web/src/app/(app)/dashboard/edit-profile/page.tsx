// EditProfilePage for SoundTribe — shadcn/ui powered
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { updateProfileAction } from '@/actions/users';
import AvatarUpload from '@/components/profile/avatar-upload';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

const schema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  location: z.string().min(1, 'Location is required'),
  bio: z.string().min(1, 'Bio is required'),
});

type EditProfileFormValues = z.infer<typeof schema>;

export default function EditProfilePage() {
  const { data: session } = useSession();
  const user = session?.user as Record<string, unknown> | undefined;
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<EditProfileFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: (user?.username as string) || '',
      firstName: (user?.firstName as string) || '',
      lastName: (user?.lastName as string) || '',
      location: (user?.location as string) || '',
      bio: (user?.bio as string) || '',
    },
  });

  useEffect(() => {
    if (user) {
      setValue('username', (user.username as string) || '');
      setValue('firstName', (user.firstName as string) || '');
      setValue('lastName', (user.lastName as string) || '');
      setValue('location', (user.location as string) || '');
      setValue('bio', (user.bio as string) || '');
    }
  }, [user, setValue]);

  const onSubmit = async (data: EditProfileFormValues) => {
    setError(null);
    setIsLoading(true);
    setSuccess(false);
    try {
      const formData = new FormData();
      formData.append('username', data.username);
      formData.append('firstName', data.firstName);
      formData.append('lastName', data.lastName);
      formData.append('location', data.location);
      formData.append('bio', data.bio);
      const result = await updateProfileAction(formData);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push('/dashboard'), 1200);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Profile update failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, type: 'spring', bounce: 0.2 }}
        className="max-w-md mx-auto"
      >
        <Card>
          <CardHeader>
            <CardTitle>Edit Your Profile</CardTitle>
            <CardDescription>Update your basic information below.</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive mb-4">{error}</div>
            )}
            {success && (
              <div className="rounded-lg border border-emerald-500/50 bg-emerald-500/10 p-3 text-sm text-emerald-500 flex items-center gap-2 mb-4">
                <CheckCircle className="h-4 w-4" /> Profile updated! Redirecting...
              </div>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="flex justify-center mb-8">
                <AvatarUpload
                  currentImage={(user?.profileImage as string | null) ?? null}
                  username={(user?.username as string) ?? ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" {...register('username')} />
                {errors.username && <p className="text-sm text-destructive">{errors.username.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" {...register('firstName')} />
                {errors.firstName && <p className="text-sm text-destructive">{errors.firstName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" {...register('lastName')} />
                {errors.lastName && <p className="text-sm text-destructive">{errors.lastName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" {...register('location')} />
                {errors.location && <p className="text-sm text-destructive">{errors.location.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" {...register('bio')} rows={3} />
                {errors.bio && <p className="text-sm text-destructive">{errors.bio.message}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
