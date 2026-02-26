/**
 * Auth layout — minimal centered card layout for unauthenticated pages.
 * No Navbar, no Footer. Just a clean centered container with the same
 * dark gradient background as the rest of the app.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 bg-black overflow-hidden">
      {/* Ambient gradient blobs — matches landing page aesthetic */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-fuchsia-700/30 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-cyan-700/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-700/10 blur-2xl" />
      </div>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
