'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // TODO: Send to error-reporting service (e.g. Sentry) in Phase 8
    console.error('[GlobalError]', error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black px-4 text-center text-white">
      <h1 className="text-4xl font-bold tracking-tight">Something went wrong</h1>
      <p className="mt-4 text-gray-400">{error.message || 'An unexpected error occurred.'}</p>
      <button
        onClick={reset}
        className="mt-8 rounded-lg bg-purple-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-purple-700"
      >
        Try Again
      </button>
    </main>
  );
}
