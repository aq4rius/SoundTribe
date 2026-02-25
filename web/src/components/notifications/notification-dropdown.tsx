'use client';

import type { NavNotification } from './notification-bell';

interface NotificationDropdownProps {
  notifications: NavNotification[];
  loading: boolean;
  unreadCount: number;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onClose: () => void;
}

function notificationHref(n: NavNotification): string {
  if (n.type === 'new_message' && n.relatedEntityId) {
    return `/chat?conversationId=${n.relatedEntityId}`;
  }
  if (
    (n.type === 'application_submitted' || n.type === 'application_status') &&
    n.relatedEntityId
  ) {
    return `/events/${n.relatedEntityId}`;
  }
  if (n.relatedEntityType === 'event_posting' && n.relatedEntityId) {
    return `/events/${n.relatedEntityId}`;
  }
  return '#';
}

function notificationIcon(type: string): string {
  switch (type) {
    case 'new_message':
      return 'message';
    case 'application_submitted':
      return 'check_circle';
    case 'application_status':
      return 'info';
    default:
      return 'notifications';
  }
}

export function NotificationDropdown({
  notifications,
  loading,
  unreadCount,
  onMarkRead,
  onMarkAllRead,
  onClose,
}: NotificationDropdownProps) {
  return (
    <div className="absolute right-0 mt-2 w-80 bg-black/95 border border-fuchsia-900 rounded shadow-lg z-50 max-h-96 overflow-y-auto">
      {/* Header */}
      <div className="p-2 font-semibold border-b border-fuchsia-900 text-white flex items-center justify-between">
        <span>Notifications</span>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              className="text-xs text-cyan-400 hover:underline"
              onClick={onMarkAllRead}
            >
              Mark all read
            </button>
          )}
          <button
            className="text-xs text-fuchsia-400 hover:underline"
            onClick={() => {
              onClose();
              window.location.href = '/dashboard/notifications';
            }}
          >
            Settings
          </button>
        </div>
      </div>

      {/* Body */}
      {loading ? (
        <div className="p-4 text-center text-white/60">Loading...</div>
      ) : notifications.length === 0 ? (
        <div className="p-4 text-center text-white/60">No notifications</div>
      ) : (
        notifications.map((n) => {
          const href = notificationHref(n);
          return (
            <div
              key={n.id}
              className={`flex items-start gap-2 px-4 py-3 border-b last:border-b-0 ${
                n.read ? 'bg-black' : 'bg-fuchsia-950/40'
              } cursor-pointer hover:bg-white/5 transition-colors`}
              onClick={() => {
                if (!n.read) onMarkRead(n.id);
                onClose();
                if (href !== '#') window.location.href = href;
              }}
            >
              <div className="flex-shrink-0">
                <span className="material-icons text-2xl text-white">
                  {notificationIcon(n.type)}
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
  );
}
