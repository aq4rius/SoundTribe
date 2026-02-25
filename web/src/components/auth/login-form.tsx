// LoginForm — NextAuth v5 credentials login via server action
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import ResendVerification from './resend-verification';
import { loginSchema, type LoginFormValues } from '@/validations/auth';
import { loginAction } from '@/actions/auth';

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setError(null);
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('email', data.email);
      formData.append('password', data.password);

      const result = await loginAction(formData);

      if (!result.success) {
        setError(result.error ?? 'Login failed');
        return;
      }

      if (result.data?.onboardingComplete === false) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto mt-12 p-8 rounded-2xl shadow-xl bg-white/10 backdrop-blur-lg border border-white/20 relative overflow-hidden"
      style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.25)' }}
    >
      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-fuchsia-500/40 via-cyan-400/30 to-emerald-400/40 blur-xl opacity-60 -z-10" />
      <h2 className="text-3xl font-extrabold text-center bg-gradient-to-r from-fuchsia-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent mb-8 drop-shadow-lg">
        Welcome Back
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <div>
          <label htmlFor="email" className="block text-white/80 font-semibold mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            {...register('email')}
            className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:ring-2 focus:ring-cyan-400 focus:outline-none transition"
            placeholder="you@email.com"
          />
          {errors.email && <p className="text-fuchsia-400 text-sm mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <label htmlFor="password" className="block text-white/80 font-semibold mb-2">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register('password')}
            className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:ring-2 focus:ring-fuchsia-400 focus:outline-none transition"
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="text-fuchsia-400 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>
        {error && (
          <div className="text-red-400 text-center text-sm">
            {error}
            {/* Show resend verification if error is about verification */}
            {error.toLowerCase().includes('verify your email') && (
              <ResendVerification
                email={
                  // Use the email from the form state
                  (document.getElementById('email') as HTMLInputElement | null)?.value || ''
                }
              />
            )}
          </div>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 mt-2 rounded-lg bg-gradient-to-r from-fuchsia-500 via-cyan-400 to-emerald-400 text-white font-bold text-lg shadow-lg hover:from-fuchsia-400 hover:to-emerald-300 transition-all duration-200 focus:ring-2 focus:ring-cyan-400 focus:outline-none disabled:opacity-60"
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
        <div className="text-right mt-2">
          <a
            href="/auth/forgot-password"
            className="text-cyan-300 hover:underline text-sm font-semibold transition-colors duration-150"
          >
            Forgot password?
          </a>
        </div>
      </form>
      <div className="mt-6 text-center text-white/70">
        Don&apos;t have an account?{' '}
        <a href="/auth/register" className="text-cyan-300 hover:underline font-semibold">
          Sign up
        </a>
      </div>
    </motion.div>
  );
}
