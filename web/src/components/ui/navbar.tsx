'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { MessageSquare } from 'lucide-react';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { Button } from '@/components/ui/button';
import { getTotalUnreadCountAction } from '@/actions/messages';

export default function Navbar() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const user = session?.user;
  const [menuOpen, setMenuOpen] = useState(false);
  const [chatUnreadCount, setChatUnreadCount] = useState(0);

  useEffect(() => {
    if (status !== 'authenticated') return;
    getTotalUnreadCountAction().then((result) => {
      if (result.success) setChatUnreadCount(result.data.count);
    });
  }, [status]);

  return (
    <nav className="fixed top-0 left-0 w-full z-30 grid grid-cols-[1fr_auto_1fr] items-center px-4 md:px-8 py-4 bg-black/60 backdrop-blur-md border-b border-white/10">

      {/* ── Column 1: Logo ── */}
      <Link href="/" className="justify-self-start relative z-30">
        <span className="text-2xl font-extrabold bg-gradient-to-r from-fuchsia-500 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
          SoundTribe
        </span>
      </Link>

      {/* ── Column 2: Nav links (centered) ── */}
      <div
        className={`justify-self-center flex-col md:flex-row md:flex gap-6 text-lg font-medium absolute md:static top-16 left-0 w-full md:w-auto bg-black/90 md:bg-transparent p-4 md:p-0 transition-all duration-200 z-20 ${menuOpen ? 'flex' : 'hidden md:flex'}`}
      >
        <Link
          href="/artists"
          className="hover:text-fuchsia-400 transition-colors"
          onClick={() => setMenuOpen(false)}
        >
          Artists
        </Link>
        <Link
          href="/events"
          className="hover:text-cyan-400 transition-colors"
          onClick={() => setMenuOpen(false)}
        >
          Events
        </Link>
        {user && (
          <Link
            href="/dashboard"
            className="hover:text-white transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            Dashboard
          </Link>
        )}
      </div>

      {/* ── Column 3: Right actions ── */}
      <div className="justify-self-end flex items-center gap-3 relative z-30">

        {/* Hamburger — mobile only */}
        <button
          className="md:hidden text-white"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle navigation menu"
        >
          <span className="material-icons">menu</span>
        </button>

        {/* Notification bell */}
        {user?.id && <NotificationBell userId={user.id} />}

        {/* Chat icon — authenticated only */}
        {status === 'authenticated' && (
          <Link
            href="/chat"
            aria-label="Messages"
            className="relative flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full hover:bg-white/10 transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            <MessageSquare className="h-5 w-5" />
            {chatUnreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white leading-none">
                {chatUnreadCount > 9 ? '9+' : chatUnreadCount}
              </span>
            )}
          </Link>
        )}

        {/* Loading skeleton — avoids flicker between auth states */}
        {status === 'loading' && (
          <div className="h-9 w-24 rounded bg-white/10 animate-pulse" />
        )}

        {/* Authenticated — show avatar, username, logout */}
        {status === 'authenticated' && user && (
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              onClick={() => setMenuOpen(false)}
            >
              {user.profileImage ? (
                <Image
                  src={user.profileImage}
                  alt={user.username ?? 'avatar'}
                  width={32}
                  height={32}
                  className="rounded-full object-cover border border-white/20"
                />
              ) : (
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-fuchsia-600 text-white text-sm font-bold border border-white/20">
                  {(user.username ?? user.email ?? 'U')[0].toUpperCase()}
                </span>
              )}
              <span className="hidden md:inline text-sm font-semibold text-white/90 max-w-[100px] truncate">
                {user.username ?? user.email}
              </span>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await signOut({ redirect: false });
                router.refresh();
                router.push('/');
              }}
            >
              Logout
            </Button>
          </div>
        )}

        {/* Unauthenticated — Login + Register */}
        {status === 'unauthenticated' && (
          <div className="flex gap-3">
            <Button size="sm" asChild>
              <Link
                href="/auth/login"
                onClick={() => setMenuOpen(false)}
              >
                Login
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link
                href="/auth/register"
                onClick={() => setMenuOpen(false)}
              >
                Register
              </Link>
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}
