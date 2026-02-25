'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import {
  useNotifications,
  useMarkNotificationRead,
  useDeleteNotification,
} from '@/hooks/use-notifications';
import { io } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { env } from '@/lib/env';

export default function Navbar() {
  const { data: session } = useSession();
  const user = session?.user;
  const [menuOpen, setMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  // TRANSITIONAL: token is undefined until Phase 3 migrates Express API calls
  const token: string | undefined = undefined;
  const { data: notifications = [], isLoading: notifLoading } = useNotifications(token);
  const markRead = useMarkNotificationRead(token);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const deleteNotif = useDeleteNotification(token);
  const queryClient = useQueryClient();

  // Real-time notifications via socket.io
  useEffect(() => {
    if (!user) return;
    const socket = io(env.NEXT_PUBLIC_SOCKET_URL, { withCredentials: true });
    socket.emit('join-entity', { entityId: user.id, entityType: 'User' });
    socket.on('new-notification', () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    });
    return () => {
      socket.off('new-notification');
      socket.emit('leave-entity', { entityId: user.id, entityType: 'User' });
      socket.disconnect();
    };
  }, [user, queryClient]);

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
                  notifications
                    .filter((n) => {
                      // Debug: log notification objects for troubleshooting
                      if (n.type === 'new_message') {
                        // eslint-disable-next-line no-console
                        console.log('Notification:', n);
                      }
                      // Only deduplicate if user is viewing the exact conversation
                      if (
                        n.type === 'new_message' &&
                        typeof window !== 'undefined' &&
                        window.location.pathname === '/chat' &&
                        n.relatedEntity?.id &&
                        window.location.search.includes(`messageId=${n.relatedEntity.id}`)
                      ) {
                        return false;
                      }
                      return true;
                    })
                    .map((n) => {
                      // Always link to chat for new_message, fallback to /chat if missing
                      let href = '#';
                      if (n.type === 'new_message' && n.relatedEntity?.id) {
                        href = `/chat?messageId=${n.relatedEntity.id}`;
                      } else if (
                        (n.type === 'application_submitted' || n.type === 'application_status') &&
                        n.relatedEntity
                      ) {
                        href = `/dashboard/applications/${n.relatedEntity.id}`;
                      } else if (n.relatedEntity && n.relatedEntity.type === 'Event') {
                        href = `/events/${n.relatedEntity.id}`;
                      } else if (n.type === 'new_message') {
                        href = '/chat';
                      }
                      return (
                        <div
                          key={n._id}
                          className={`flex items-start gap-2 px-4 py-3 border-b last:border-b-0 ${n.read ? 'bg-black' : 'bg-fuchsia-950/40'} cursor-pointer`}
                          onClick={() => {
                            if (!n.read) markRead.mutate(n._id);
                            setShowNotifications(false);
                            window.location.href = href;
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
                                    : n.relatedEntity && n.relatedEntity.type === 'Event'
                                      ? 'event'
                                      : 'notifications'}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="text-sm text-white/80">{n.content}</div>
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
