import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black px-4 text-center text-white">
      <h1 className="text-6xl font-bold tracking-tight">404</h1>
      <p className="mt-4 text-xl text-gray-400">
        This page doesn&apos;t exist — maybe the beat dropped too hard.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-lg bg-purple-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-purple-700"
      >
        Back to Home
      </Link>
    </main>
  );
}
