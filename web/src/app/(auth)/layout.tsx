/**
 * Auth layout — minimal centered card layout for unauthenticated pages.
 * No Navbar, no Footer. Just a clean centered container.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
