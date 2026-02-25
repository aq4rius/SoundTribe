// ResendVerification.tsx
'use client';
import { useState } from 'react';
import { resendVerificationAction } from '@/actions/auth';

export default function ResendVerification({ email }: { email: string }) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleResend = async () => {
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const result = await resendVerificationAction(email);
      if (!result.success) throw new Error(result.error);
      setMessage(result.data.message);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to resend verification email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 text-center">
      <button
        onClick={handleResend}
        disabled={loading}
        className="px-4 py-2 rounded bg-cyan-600 text-white font-semibold hover:bg-cyan-700 disabled:opacity-60"
      >
        {loading ? 'Sending...' : 'Resend Verification Email'}
      </button>
      {message && <div className="text-green-400 mt-2">{message}</div>}
      {error && <div className="text-red-400 mt-2">{error}</div>}
    </div>
  );
}
