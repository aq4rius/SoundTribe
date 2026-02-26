'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { NotificationBell } from '@/components/notifications/notification-bell';

export default function Navbar() {
  const { data: session } = useSession();
  const user = session?.user;
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 w-full z-30 flex items-center justify-between px-4 md:px-8 py-4 bg-black/60 backdrop-blur-md border-b border-white/10">
      <Link href="/">
        <span className="text-2xl font-extrabold bg-gradient-to-r from-fuchsia-500 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
          SoundTribe
        </span>
      </Link>
      <button className="md:hidden ml-auto text-white" onClick={() => setMenuOpen((v) => !v)} aria-label="Toggle navigation menu">
        <span className="material-icons">menu</span>
      </button>
      <div
        className={`flex-col md:flex-row md:flex gap-6 text-lg font-medium absolute md:static top-16 left-0 w-full md:w-auto bg-black/90 md:bg-transparent p-4 md:p-0 transition-all duration-200 ${menuOpen ? 'flex' : 'hidden md:flex'}`}
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
      <div className="flex gap-4 items-center">
        {user?.id && <NotificationBell userId={user.id} />}
        {user ? (
          <button
            className="px-4 py-2 text-sm font-semibold bg-fuchsia-600 hover:bg-fuchsia-700 rounded transition-all"
            onClick={async () => {
              await signOut({ redirect: false });
              window.location.href = '/';
            }}
          >
            Logout
          </button>
        ) : (
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-semibold bg-fuchsia-600 hover:bg-fuchsia-700 rounded transition-all"
            onClick={() => setMenuOpen(false)}
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
