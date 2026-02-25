// Email verification page for SoundTribe
'use client';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { env } from '@/lib/env';

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="text-center text-white/60 mt-16">Verifying...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Missing verification token.');
      return;
    }
    fetch(`${env.NEXT_PUBLIC_API_URL}/api/auth/verify-email?token=${token}`)
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setStatus('success');
          setMessage('Your email has been verified! You can now log in.');
          setTimeout(() => router.push('/auth/login'), 2500);
        } else {
          setStatus('error');
          setMessage(data.message || 'Verification failed.');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Verification failed.');
      });
  }, [searchParams, router]);

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
        Email Verification
      </h2>
      <div
        className={`text-center text-lg font-semibold space-y-2 ${status === 'success' ? 'text-emerald-300' : status === 'error' ? 'text-red-400' : 'text-white/80'}`}
      >
        {status === 'pending' && (
          <svg
            className="mx-auto mb-2 animate-spin"
            width="40"
            height="40"
            fill="none"
            viewBox="0 0 40 40"
          >
            <circle
              cx="20"
              cy="20"
              r="18"
              stroke="#06B6D4"
              strokeWidth="4"
              strokeDasharray="90 60"
            />
          </svg>
        )}
        {status === 'success' && (
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
        )}
        {status === 'error' && (
          <svg className="mx-auto mb-2" width="48" height="48" fill="none" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="24" fill="#f43f5e" />
            <path
              d="M16 16l16 16M32 16L16 32"
              stroke="#fff"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        )}
        <div>{message}</div>
        {status === 'error' && (
          <div className="mt-4">
            <a
              href="/auth/login"
              className="text-cyan-300 hover:underline font-semibold transition-colors duration-150"
            >
              Go to login
            </a>
          </div>
        )}
      </div>
    </motion.div>
  );
}
