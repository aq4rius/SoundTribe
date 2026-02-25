// ForgotPasswordPage for SoundTribe - extraordinary, animated, and responsive
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { forgotPasswordAction } from '@/actions/auth';

const schema = z.object({
  email: z.string().email('Please provide a valid email'),
});

type ForgotPasswordFormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setError(null);
    setIsLoading(true);
    try {
      const result = await forgotPasswordAction(data.email);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setSubmitted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send reset email');
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
        Reset Your Password
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
            <path
              d="M16 24l6 6 10-10"
              stroke="#fff"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <defs>
              <linearGradient
                id="grad"
                x1="0"
                y1="0"
                x2="48"
                y2="48"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#D946EF" />
                <stop offset="0.5" stopColor="#06B6D4" />
                <stop offset="1" stopColor="#34D399" />
              </linearGradient>
            </defs>
          </svg>
          <div>Password reset link sent!</div>
          <div className="text-white/70 text-sm">Check your email for instructions.</div>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-7">
          <div>
            <label htmlFor="email" className="block text-white/80 font-semibold mb-2">
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              {...register('email')}
              className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:ring-2 focus:ring-cyan-400 focus:outline-none transition"
              placeholder="you@email.com"
            />
            {errors.email && (
              <p className="text-fuchsia-400 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>
          {error && <div className="text-red-400 text-center text-sm">{error}</div>}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-lg bg-gradient-to-r from-fuchsia-500 via-cyan-400 to-emerald-400 text-white font-bold text-lg shadow-lg hover:from-fuchsia-400 hover:to-emerald-300 transition-all duration-200 focus:ring-2 focus:ring-cyan-400 focus:outline-none disabled:opacity-60"
          >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      )}
      <div className="mt-8 text-center text-white/60 text-sm">
        <a
          href="/auth/login"
          className="text-cyan-300 hover:underline font-semibold transition-colors duration-150"
        >
          Back to login
        </a>
      </div>
    </motion.div>
  );
}
