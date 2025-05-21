// ResendVerification.tsx
'use client';
import { useState } from 'react';

export default function ResendVerification({ email }: { email: string }) {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleResend = async () => {
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/resend-verification-email`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to resend verification email');
      setMessage('Verification email sent! Please check your inbox.');
    } catch (e: any) {
      setError(e.message || 'Failed to resend verification email');
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
