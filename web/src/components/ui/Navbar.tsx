'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  useNotifications,
  useMarkNotificationRead,
  useDeleteNotification,
} from '@/hooks/useNotifications';

// Notification type for navbar
interface Notification {
  _id: string;
  content: string;
  read: boolean;
  createdAt: string;
}

export default function Navbar() {
  const { user, clearAuth } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const token =
    typeof window !== 'undefined' && localStorage.getItem('auth')
      ? JSON.parse(localStorage.getItem('auth')!).token
      : undefined;
  const { data: notifications = [], isLoading: notifLoading } = useNotifications(token);
  const markRead = useMarkNotificationRead(token);
  const deleteNotif = useDeleteNotification(token);

  return (
    <nav className="fixed top-0 left-0 w-full z-30 flex items-center justify-between px-4 md:px-8 py-4 bg-black/60 backdrop-blur-md border-b border-white/10">
      <Link href="/">
        <span className="text-2xl font-extrabold bg-gradient-to-r from-fuchsia-500 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
          SoundTribe
        </span>
      </Link>
      <button className="md:hidden ml-auto text-white" onClick={() => setMenuOpen((v) => !v)}>
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
            href="/chat"
            className="hover:text-emerald-400 transition-colors"
            onClick={() => setMenuOpen(false)}
          >
            Chat
          </Link>
        )}
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
        {user && (
          <div className="relative">
            <button
              className="relative px-2 py-2"
              aria-label="Notifications"
              onClick={() => setShowNotifications((v) => !v)}
            >
              <span className="material-icons align-middle text-white">notifications</span>
              {notifications.some((n) => !n.read) && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-black/95 border border-fuchsia-900 rounded shadow-lg z-50 max-h-96 overflow-y-auto">
                <div className="p-2 font-semibold border-b border-fuchsia-900 text-white">
                  Notifications
                </div>
                {notifLoading ? (
                  <div className="p-4 text-center text-white/60">Loading...</div>
                ) : notifications.length === 0 ? (
                  <div className="p-4 text-center text-white/60">No notifications</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      className={`flex items-start gap-2 px-4 py-3 border-b last:border-b-0 ${n.read ? 'bg-black' : 'bg-fuchsia-950/40'}`}
                    >
                      <div className="flex-1">
                        <div className="font-medium text-sm text-white">{n.content}</div>
                        <div className="text-xs text-white/40">
                          {new Date(n.createdAt).toLocaleString()}
                        </div>
                        {!n.read && (
                          <button
                            className="text-xs text-blue-400 mr-2"
                            onClick={() => markRead.mutate(n._id)}
                          >
                            Mark as read
                          </button>
                        )}
                        <button
                          className="text-xs text-gray-400 hover:text-red-500"
                          onClick={() => deleteNotif.mutate(n._id)}
                        >
                          &times;
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
        {!user ? (
          <>
            <Link
              href="/auth/login"
              className="px-4 py-2 rounded-full bg-gradient-to-r from-fuchsia-600 to-cyan-400 text-white font-bold shadow hover:from-fuchsia-500 hover:to-cyan-300 transition"
            >
              Login
            </Link>
            <Link
              href="/auth/register"
              className="px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400 text-white font-bold shadow hover:from-emerald-400 hover:to-cyan-300 transition"
            >
              Sign Up
            </Link>
          </>
        ) : (
          <>
            <span className="hidden md:inline text-white/80 font-semibold">{user.username}</span>
            <button
              onClick={() => {
                clearAuth();
                if (typeof window !== 'undefined') localStorage.removeItem('auth');
                window.location.href = '/';
              }}
              className="px-4 py-2 rounded-full bg-gradient-to-r from-cyan-600 to-fuchsia-500 text-white font-bold shadow hover:from-cyan-500 hover:to-fuchsia-400 transition"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
