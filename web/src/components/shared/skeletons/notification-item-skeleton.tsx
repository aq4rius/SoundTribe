import { Skeleton } from '@/components/ui/skeleton';

export function NotificationItemSkeleton() {
  return (
    <div className="flex items-start gap-3 p-4 border-b border-white/10">
      <Skeleton className="w-8 h-8 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/4" />
      </div>
      <Skeleton className="h-8 w-20 rounded" />
    </div>
  );
}
