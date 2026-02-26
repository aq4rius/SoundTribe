/**
 * Auth layout — minimal centered card layout for unauthenticated pages.
 * No Navbar, no Footer. Just a clean centered container with the same
 * dark gradient background as the rest of the app.
 */
import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col px-4 bg-black overflow-hidden">
      {/* Ambient gradient blobs — matches landing page aesthetic */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-fuchsia-700/30 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-cyan-700/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-700/10 blur-2xl" />
      </div>

      {/* Minimal header with SoundTribe wordmark */}
      <header className="w-full py-4">
        <Link href="/" className="inline-flex items-center gap-2 text-white font-bold text-xl tracking-tight hover:text-fuchsia-400 transition">
          <span className="text-fuchsia-500">&clubs;</span> SoundTribe
        </Link>
      </header>

      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
