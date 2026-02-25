'use client';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import {
  getNotificationsAction,
  markAsReadAction,
  getUnreadCountAction,
} from '@/actions/notifications';

interface NavNotification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  relatedEntityId: string | null;
  relatedEntityType: string | null;
  createdAt: string | Date;
}

export default function Navbar() {
  const { data: session } = useSession();
  const user = session?.user;
  const [menuOpen, setMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NavNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifLoading, setNotifLoading] = useState(false);

  const fetchUnreadCount = useCallback(async () => {
    const result = await getUnreadCountAction();
    if (result.success) setUnreadCount(result.data);
  }, []);

  const fetchNotifications = useCallback(async () => {
    setNotifLoading(true);
    const result = await getNotificationsAction(1, 10);
    if (result.success) {
      setNotifications(result.data.data as unknown as NavNotification[]);
      setUnreadCount(result.data.unreadCount);
    }
    setNotifLoading(false);
  }, []);

  // Poll unread count every 30 seconds
  useEffect(() => {
    if (!user) return;
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user, fetchUnreadCount]);

  // Fetch full notifications when dropdown opens
  useEffect(() => {
    if (showNotifications && user) fetchNotifications();
  }, [showNotifications, user, fetchNotifications]);

  const handleMarkRead = async (id: string) => {
    const result = await markAsReadAction(id);
    if (result.success) {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    }
  };

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
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-black/95 border border-fuchsia-900 rounded shadow-lg z-50 max-h-96 overflow-y-auto">
                <div className="p-2 font-semibold border-b border-fuchsia-900 text-white flex items-center justify-between">
                  <span>Notifications</span>
                  <button
                    className="text-xs text-fuchsia-400 hover:underline"
                    onClick={() => {
                      setShowNotifications(false);
                      window.location.href = '/dashboard/notifications';
                    }}
                  >
                    Settings
                  </button>
                </div>
                {notifLoading ? (
                  <div className="p-4 text-center text-white/60">Loading...</div>
                ) : notifications.length === 0 ? (
                  <div className="p-4 text-center text-white/60">No notifications</div>
                ) : (
                  notifications.map((n) => {
                    let href = '#';
                    if (n.type === 'new_message' && n.relatedEntityId) {
                      href = `/chat?messageId=${n.relatedEntityId}`;
                    } else if (
                      (n.type === 'application_submitted' || n.type === 'application_status') &&
                      n.relatedEntityId
                    ) {
                      href = `/events/${n.relatedEntityId}`;
                    } else if (n.relatedEntityType === 'event_posting' && n.relatedEntityId) {
                      href = `/events/${n.relatedEntityId}`;
                    }
                    return (
                      <div
                        key={n.id}
                        className={`flex items-start gap-2 px-4 py-3 border-b last:border-b-0 ${n.read ? 'bg-black' : 'bg-fuchsia-950/40'} cursor-pointer`}
                        onClick={() => {
                          if (!n.read) handleMarkRead(n.id);
                          setShowNotifications(false);
                          if (href !== '#') window.location.href = href;
                        }}
                      >
                        <div className="flex-shrink-0">
                          <span className="material-icons text-2xl text-white">
                            {n.type === 'new_message'
                              ? 'message'
                              : n.type === 'application_submitted'
                                ? 'check_circle'
                                : n.type === 'application_status'
                                  ? 'info'
                                  : 'notifications'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="text-sm text-white/80">{n.message}</div>
                          <div className="text-xs text-white/60">
                            {new Date(n.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}
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
