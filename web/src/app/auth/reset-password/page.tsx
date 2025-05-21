// ResetPasswordPage for SoundTribe - extraordinary, animated, and responsive
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const schema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type ResetPasswordFormValues = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/reset-password`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, password: data.password }),
        },
      );
      if (!res.ok) {
        const err = await res.json();
        setError(err.message || 'Failed to reset password');
        return;
      }
      setSubmitted(true);
      setTimeout(() => router.push('/auth/login'), 2000);
    } catch (e: any) {
      setError(e.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, type: 'spring', bounce: 0.3 }}
      className="w-full max-w-md mx-auto mt-16 p-10 rounded-3xl shadow-2xl bg-gradient-to-br from-fuchsia-900/60 via-cyan-900/50 to-emerald-900/60 border border-white/20 relative overflow-hidden"
      style={{ boxShadow: '0 12px 48px 0 rgba(31, 38, 135, 0.35)' }}
    >
      <div className="absolute -inset-2 rounded-3xl bg-gradient-to-br from-fuchsia-500/30 via-cyan-400/20 to-emerald-400/30 blur-2xl opacity-70 -z-10 animate-pulse" />
      <h2 className="text-3xl font-extrabold text-center bg-gradient-to-r from-fuchsia-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent mb-8 drop-shadow-lg tracking-tight">
        Set a New Password
      </h2>
      {submitted ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center text-lg text-emerald-300 font-semibold space-y-2"
        >
          <svg className="mx-auto mb-2" width="48" height="48" fill="none" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="24" fill="url(#grad)" />
            <path d="M16 24l6 6 10-10" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                <stop stopColor="#D946EF" />
                <stop offset="0.5" stopColor="#06B6D4" />
                <stop offset="1" stopColor="#34D399" />
              </linearGradient>
            </defs>
          </svg>
          <div>Password reset! Redirecting to login...</div>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-7">
          <div>
            <label htmlFor="password" className="block text-white/80 font-semibold mb-2">
              New Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              {...register('password')}
              className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:ring-2 focus:ring-fuchsia-400 focus:outline-none transition"
              placeholder="••••••••"
            />
            {errors.password && <p className="text-fuchsia-400 text-sm mt-1">{errors.password.message}</p>}
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-white/80 font-semibold mb-2">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              {...register('confirmPassword')}
              className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:ring-2 focus:ring-cyan-400 focus:outline-none transition"
              placeholder="••••••••"
            />
            {errors.confirmPassword && <p className="text-fuchsia-400 text-sm mt-1">{errors.confirmPassword.message}</p>}
          </div>
          {error && <div className="text-red-400 text-center text-sm">{error}</div>}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-fuchsia-500 via-cyan-400 to-emerald-400 text-white font-bold text-lg shadow-lg hover:from-fuchsia-400 hover:to-emerald-300 transition-all duration-200 focus:ring-2 focus:ring-cyan-400 focus:outline-none disabled:opacity-60"
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      )}
      <div className="mt-8 text-center text-white/60 text-sm">
        <a href="/auth/login" className="text-cyan-300 hover:underline font-semibold transition-colors duration-150">
          Back to login
        </a>
      </div>
    </motion.div>
  );
}
