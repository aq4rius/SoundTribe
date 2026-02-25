// RegisterForm — NextAuth v5 credentials registration via server action
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { registerSchema, type RegisterFormValues } from '@/validations/auth';
import { registerAction } from '@/actions/auth';

export default function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setError(null);
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('username', data.username);
      formData.append('email', data.email);
      formData.append('password', data.password);
      formData.append('confirmPassword', data.confirmPassword);

      const result = await registerAction(formData);

      if (!result.success) {
        setError(result.error ?? 'Registration failed');
        return;
      }

      // Registration successful — redirect to onboarding
      router.push('/onboarding');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Registration failed');
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
        Create Account
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <div>
          <label htmlFor="username" className="block text-white/80 font-semibold mb-2">
            Username
          </label>
          <input
            id="username"
            type="text"
            autoComplete="username"
            {...register('username')}
            className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:ring-2 focus:ring-cyan-400 focus:outline-none transition"
            placeholder="yourname"
          />
          {errors.username && (
            <p className="text-fuchsia-400 text-sm mt-1">{errors.username.message}</p>
          )}
        </div>
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
            autoComplete="new-password"
            {...register('password')}
            className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/60 border border-white/30 focus:ring-2 focus:ring-fuchsia-400 focus:outline-none transition"
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="text-fuchsia-400 text-sm mt-1">{errors.password.message}</p>
          )}
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
          {errors.confirmPassword && (
            <p className="text-fuchsia-400 text-sm mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>
        {error && <div className="text-red-400 text-center text-sm">{error}</div>}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 mt-2 rounded-lg bg-gradient-to-r from-fuchsia-500 via-cyan-400 to-emerald-400 text-white font-bold text-lg shadow-lg hover:from-fuchsia-400 hover:to-emerald-300 transition-all duration-200 focus:ring-2 focus:ring-cyan-400 focus:outline-none disabled:opacity-60"
        >
          {isLoading ? 'Registering...' : 'Sign Up'}
        </button>
      </form>
      <div className="mt-6 text-center text-white/70">
        Already have an account?{' '}
        <a href="/auth/login" className="text-cyan-300 hover:underline font-semibold">
          Login
        </a>
      </div>
    </motion.div>
  );
}
