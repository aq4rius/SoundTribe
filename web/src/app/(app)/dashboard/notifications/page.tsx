"use client";
import { useAuth } from '@/hooks/use-auth';
import {
  useNotifications,
  useMarkNotificationRead,
  useDeleteNotification,
} from '@/hooks/use-notifications';
import Link from 'next/link';
import { useState } from 'react';
import { env } from '@/lib/env';

export default function NotificationsPage() {
  const { user } = useAuth();
  const token = typeof window !== 'undefined' && localStorage.getItem('auth')
    ? JSON.parse(localStorage.getItem('auth')!).token
    : undefined;
  const { data: notifications = [], isLoading } = useNotifications(token);
  const markRead = useMarkNotificationRead(token);
  const deleteNotif = useDeleteNotification(token);

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center text-lg text-white/80">
        Please <Link href="/auth/login" className="text-fuchsia-400 underline">log in</Link> to view your notifications.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6 text-white">Notification Center</h1>
      <NotificationPreferencesSection />
      <div className="bg-black/80 rounded-lg shadow border border-fuchsia-900 mt-8">
        <div className="p-4 border-b border-fuchsia-900 text-lg font-semibold text-white">All Notifications</div>
        {isLoading ? (
          <div className="p-6 text-center text-white/60">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="p-6 text-center text-white/60">No notifications found.</div>
        ) : (
          notifications.map((n) => {
            let href = '#';
            if (n.type === 'new_message' && n.relatedEntity) {
              href = `/chat?messageId=${n.relatedEntity.id}`;
            } else if ((n.type === 'application_submitted' || n.type === 'application_status') && n.relatedEntity) {
              href = `/dashboard/applications/${n.relatedEntity.id}`;
            } else if (n.relatedEntity && n.relatedEntity.type === 'Event') {
              href = `/events/${n.relatedEntity.id}`;
            }
            return (
              <div
                key={n._id}
                className={`flex items-start gap-2 px-4 py-3 border-b last:border-b-0 ${n.read ? 'bg-black' : 'bg-fuchsia-950/40'} cursor-pointer`}
                onClick={() => {
                  if (!n.read) markRead.mutate(n._id);
                  if (href !== '#') window.location.href = href;
                }}
              >
                <div className="flex-1">
                  <div className="font-medium text-sm text-white">{n.content}</div>
                  <div className="text-xs text-white/40">{new Date(n.createdAt).toLocaleString()}</div>
                  {!n.read && (
                    <button
                      className="text-xs text-blue-400 mr-2"
                      onClick={e => { e.stopPropagation(); markRead.mutate(n._id); }}
                    >Mark as read</button>
                  )}
                  <button
                    className="text-xs text-gray-400 hover:text-red-500"
                    onClick={e => { e.stopPropagation(); deleteNotif.mutate(n._id); }}
                  >&times;</button>
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
  const { user } = useAuth();
  const token = typeof window !== 'undefined' && localStorage.getItem('auth')
    ? JSON.parse(localStorage.getItem('auth')!).token
    : undefined;
  const [email, setEmail] = useState(user?.notificationPreferences?.email ?? true);
  const [push, setPush] = useState(user?.notificationPreferences?.push ?? true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch(`${env.NEXT_PUBLIC_API_URL}/api/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notificationPreferences: { email, push } }),
      });
      if (!res.ok) throw new Error('Failed to update preferences');
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="mb-8 p-4 bg-black/70 rounded-lg border border-fuchsia-900">
      <h2 className="text-xl font-semibold mb-2 text-fuchsia-300">Notification Preferences</h2>
      <div className="flex flex-col gap-2 mb-4">
        <label className="flex items-center gap-2 text-white">
          <input type="checkbox" checked={email} onChange={e => setEmail(e.target.checked)} />
          Email notifications
        </label>
        <label className="flex items-center gap-2 text-white">
          <input type="checkbox" checked={push} onChange={e => setPush(e.target.checked)} />
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
