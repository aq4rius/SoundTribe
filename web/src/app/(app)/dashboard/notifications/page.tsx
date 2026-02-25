'use client';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import {
  getNotificationsAction,
  markAsReadAction,
  markAllAsReadAction,
} from '@/actions/notifications';
import { updateNotificationPreferencesAction } from '@/actions/users';

interface NotificationItem {
  id: string;
  type: string;
  message: string;
  read: boolean;
  relatedEntityId: string | null;
  relatedEntityType: string | null;
  createdAt: string | Date;
}

export default function NotificationsPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    const result = await getNotificationsAction(1, 50);
    if (result.success) {
      setNotifications(result.data.data as unknown as NotificationItem[]);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user, fetchNotifications]);

  const handleMarkRead = async (id: string) => {
    const result = await markAsReadAction(id);
    if (result.success) {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    }
  };

  const handleMarkAllRead = async () => {
    const result = await markAllAsReadAction();
    if (result.success) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center text-lg text-white/80">
        Please{' '}
        <Link href="/auth/login" className="text-fuchsia-400 underline">
          log in
        </Link>{' '}
        to view your notifications.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6 text-white">Notification Center</h1>
      <NotificationPreferencesSection />
      <div className="bg-black/80 rounded-lg shadow border border-fuchsia-900 mt-8">
        <div className="p-4 border-b border-fuchsia-900 text-lg font-semibold text-white flex items-center justify-between">
          <span>All Notifications</span>
          {notifications.some((n) => !n.read) && (
            <button
              className="text-xs text-fuchsia-400 hover:underline"
              onClick={handleMarkAllRead}
            >
              Mark all as read
            </button>
          )}
        </div>
        {isLoading ? (
          <div className="p-6 text-center text-white/60">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="p-6 text-center text-white/60">No notifications found.</div>
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
                  if (href !== '#') window.location.href = href;
                }}
              >
                <div className="flex-1">
                  <div className="font-medium text-sm text-white">{n.message}</div>
                  <div className="text-xs text-white/40">
                    {new Date(n.createdAt).toLocaleString()}
                  </div>
                  {!n.read && (
                    <button
                      className="text-xs text-blue-400 mr-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkRead(n.id);
                      }}
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function NotificationPreferencesSection() {
  const { data: session } = useSession();
  const user = session?.user as Record<string, unknown> | undefined;
  const notifPrefs = user?.notificationPreferences as Record<string, boolean> | undefined;
  const [email, setEmail] = useState(notifPrefs?.email ?? true);
  const [push, setPush] = useState(notifPrefs?.push ?? true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const result = await updateNotificationPreferencesAction({ email, push });
      if (!result.success) throw new Error(result.error);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSave}
      className="mb-8 p-4 bg-black/70 rounded-lg border border-fuchsia-900"
    >
      <h2 className="text-xl font-semibold mb-2 text-fuchsia-300">Notification Preferences</h2>
      <div className="flex flex-col gap-2 mb-4">
        <label className="flex items-center gap-2 text-white">
          <input type="checkbox" checked={email} onChange={(e) => setEmail(e.target.checked)} />
          Email notifications
        </label>
        <label className="flex items-center gap-2 text-white">
          <input type="checkbox" checked={push} onChange={(e) => setPush(e.target.checked)} />
          Push notifications
        </label>
      </div>
      <button
        type="submit"
        className="px-4 py-2 rounded bg-fuchsia-600 text-white font-bold shadow hover:bg-fuchsia-500 transition disabled:opacity-60"
        disabled={saving}
      >
        {saving ? 'Saving...' : 'Save Preferences'}
      </button>
      {success && <div className="mt-2 text-green-400 text-sm">Preferences updated!</div>}
      {error && <div className="mt-2 text-red-400 text-sm">{error}</div>}
    </form>
  );
}
