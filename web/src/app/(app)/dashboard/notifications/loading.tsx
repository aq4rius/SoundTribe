import { NotificationItemSkeleton } from '@/components/shared/skeletons';
import { Skeleton } from '@/components/ui/skeleton';

export default function NotificationsLoading() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <Skeleton className="h-8 w-40" />
      {/* Preferences skeleton */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
      {/* Notification list skeleton */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02]">
        {Array.from({ length: 5 }).map((_, i) => (
          <NotificationItemSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
