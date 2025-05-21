// EditProfilePage for SoundTribe - extraordinary, animated, and responsive
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const schema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Please provide a valid email'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  location: z.string().min(1, 'Location is required'),
  bio: z.string().min(1, 'Bio is required'),
});

type EditProfileFormValues = z.infer<typeof schema>;

export default function EditProfilePage() {
  const { user, setAuth } = useAuth();
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
      username: user?.username || '',
      email: user?.email || '',
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      location: user?.location || '',
      bio: user?.bio || '',
    },
  });

  useEffect(() => {
    if (user) {
      setValue('username', user.username || '');
      setValue('email', user.email || '');
      setValue('firstName', user.firstName || '');
      setValue('lastName', user.lastName || '');
      setValue('location', user.location || '');
      setValue('bio', user.bio || '');
    }
  }, [user, setValue]);

  const onSubmit = async (data: EditProfileFormValues) => {
    setError(null);
    setIsLoading(true);
    setSuccess(false);
    try {
      let token = '';
      if (typeof window !== 'undefined') {
        const auth = localStorage.getItem('auth');
        if (auth) {
          try {
            token = JSON.parse(auth).token;
          } catch {}
        }
      }
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/profile`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(data),
          credentials: 'include',
        },
      );
      if (!res.ok) {
        const err = await res.json();
        setError(err.message || 'Profile update failed');
        return;
      }
      const updated = await res.json();
      setAuth(
        updated,
        token,
      );
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth', JSON.stringify({ user: updated, token }));
      }
      setSuccess(true);
      setTimeout(() => router.push('/dashboard'), 1200);
    } catch (e: any) {
      setError(e.message || 'Profile update failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, type: 'spring', bounce: 0.3 }}
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-md mx-auto bg-black/70 p-10 rounded-3xl shadow-2xl mt-12 border border-white/20 relative overflow-hidden"
    >
      <div className="absolute -inset-2 rounded-3xl bg-gradient-to-br from-fuchsia-500/30 via-cyan-400/20 to-emerald-400/30 blur-2xl opacity-70 -z-10 animate-pulse" />
      <h2 className="text-2xl font-bold text-center mb-4 bg-gradient-to-r from-fuchsia-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent drop-shadow-lg">
        Edit Your Profile
      </h2>
      {error && <div className="bg-red-500/20 text-red-400 p-2 rounded text-center mb-2">{error}</div>}
      {success && <div className="bg-emerald-500/20 text-emerald-300 p-2 rounded text-center mb-2 animate-pulse">Profile updated!</div>}
      <div className="grid grid-cols-1 gap-5">
        <div>
          <label className="block mb-1 text-white/80 font-semibold">Username</label>
          <input
            {...register('username')}
            className="input input-bordered w-full"
            required
            minLength={3}
          />
          {errors.username && <p className="text-fuchsia-400 text-sm mt-1">{errors.username.message}</p>}
        </div>
        <div>
          <label className="block mb-1 text-white/80 font-semibold">Email</label>
          <input
            {...register('email')}
            type="email"
            className="input input-bordered w-full"
            required
          />
          {errors.email && <p className="text-fuchsia-400 text-sm mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <label className="block mb-1 text-white/80 font-semibold">First Name</label>
          <input
            {...register('firstName')}
            className="input input-bordered w-full"
          />
          {errors.firstName && <p className="text-fuchsia-400 text-sm mt-1">{errors.firstName.message}</p>}
        </div>
        <div>
          <label className="block mb-1 text-white/80 font-semibold">Last Name</label>
          <input
            {...register('lastName')}
            className="input input-bordered w-full"
          />
          {errors.lastName && <p className="text-fuchsia-400 text-sm mt-1">{errors.lastName.message}</p>}
        </div>
        <div>
          <label className="block mb-1 text-white/80 font-semibold">Location</label>
          <input
            {...register('location')}
            className="input input-bordered w-full"
          />
          {errors.location && <p className="text-fuchsia-400 text-sm mt-1">{errors.location.message}</p>}
        </div>
        <div>
          <label className="block mb-1 text-white/80 font-semibold">Bio</label>
          <textarea
            {...register('bio')}
            className="input input-bordered w-full"
            rows={3}
          />
          {errors.bio && <p className="text-fuchsia-400 text-sm mt-1">{errors.bio.message}</p>}
        </div>
      </div>
      <button
        type="submit"
        className="btn btn-primary w-full mt-6"
        disabled={isLoading}
      >
        {isLoading ? 'Saving...' : 'Save Changes'}
      </button>
    </motion.form>
  );
}
