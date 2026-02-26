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
import { EmptyState } from '@/components/shared/empty-state';
import { Bell, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

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
      <div className="max-w-2xl mx-auto py-12 text-center text-lg text-muted-foreground">
        Please{' '}
        <Link href="/auth/login" className="text-primary underline">
          log in
        </Link>{' '}
        to view your notifications.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Notification Center</h1>
        <NotificationPreferencesSection />

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" /> All Notifications</CardTitle>
              {notifications.some((n) => !n.read) && (
                <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>
                  Mark all as read
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 text-center text-muted-foreground">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  icon={<Bell className="h-10 w-10" />}
                  title="No notifications"
                  description="You're all caught up! New notifications will appear here."
                />
              </div>
            ) : (
              <div>
                {notifications.map((n, idx) => {
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
                    <div key={n.id}>
                      <div
                        className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-muted/50 ${!n.read ? 'bg-muted/30' : ''}`}
                        onClick={() => {
                          if (!n.read) handleMarkRead(n.id);
                          if (href !== '#') window.location.href = href;
                        }}
                      >
                        <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${n.read ? 'bg-transparent' : 'bg-primary'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm">{n.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(n.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {!n.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkRead(n.id);
                            }}
                          >
                            Mark read
                          </Button>
                        )}
                      </div>
                      {idx < notifications.length - 1 && <Separator />}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
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
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={email} onChange={(e) => setEmail(e.target.checked)} className="accent-primary h-4 w-4" />
              Email notifications
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={push} onChange={(e) => setPush(e.target.checked)} className="accent-primary h-4 w-4" />
              Push notifications
            </label>
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit" size="sm" disabled={saving}>
              {saving ? 'Saving...' : 'Save Preferences'}
            </Button>
            {success && <span className="text-sm text-emerald-500 flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Updated!</span>}
            {error && <span className="text-sm text-destructive">{error}</span>}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
