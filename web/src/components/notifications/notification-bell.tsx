'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  getNotificationsAction,
  getUnreadCountAction,
  markAsReadAction,
  markAllAsReadAction,
} from '@/actions/notifications';
import { useAblyChannel } from '@/hooks/use-ably-channel';
import { NotificationDropdown } from './notification-dropdown';

export interface NavNotification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  relatedEntityId: string | null;
  relatedEntityType: string | null;
  createdAt: string | Date;
}

interface NotificationBellProps {
  userId: string;
}

export function NotificationBell({ userId }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NavNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // ── Fetch helpers ──────────────────────────────────────────────────────────

  const fetchUnreadCount = useCallback(async () => {
    const result = await getUnreadCountAction();
    if (result.success) setUnreadCount(result.data);
  }, []);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    const result = await getNotificationsAction(1, 10);
    if (result.success) {
      setNotifications(result.data.data as unknown as NavNotification[]);
      setUnreadCount(result.data.unreadCount);
    }
    setLoading(false);
  }, []);

  // ── Initial fetch ──────────────────────────────────────────────────────────

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  // Fetch full list when dropdown opens
  useEffect(() => {
    if (open) fetchNotifications();
  }, [open, fetchNotifications]);

  // ── Close on outside click ─────────────────────────────────────────────────

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // ── Real-time via Ably ─────────────────────────────────────────────────────

  useAblyChannel<{ notification: NavNotification }>({
    channelName: `notifications:${userId}`,
    eventName: 'new-notification',
    onMessage: (data) => {
      setUnreadCount((c) => c + 1);
      // Prepend to list if dropdown is open
      if (data.notification) {
        setNotifications((prev) => [data.notification, ...prev].slice(0, 10));
      }
    },
  });

  // ── Actions ────────────────────────────────────────────────────────────────

  const handleMarkRead = async (id: string) => {
    const result = await markAsReadAction(id);
    if (result.success) {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
    }
  };

  const handleMarkAllRead = async () => {
    const result = await markAllAsReadAction();
    if (result.success) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="relative" ref={containerRef}>
      <button
        className="relative px-2 py-2"
        aria-label="Notifications"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="material-icons align-middle text-white">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[8px] h-2 bg-red-500 rounded-full" />
        )}
      </button>

      {open && (
        <NotificationDropdown
          notifications={notifications}
          loading={loading}
          unreadCount={unreadCount}
          onMarkRead={handleMarkRead}
          onMarkAllRead={handleMarkAllRead}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
