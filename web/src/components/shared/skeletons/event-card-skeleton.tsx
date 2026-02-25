import { Skeleton } from '@/components/ui/skeleton';

export function EventCardSkeleton() {
  return (
    <div className="rounded-xl bg-gradient-to-br from-black/80 to-cyan-900/40 shadow-lg p-6 flex flex-col gap-2 border border-white/10">
      <div className="flex items-center gap-4">
        <Skeleton className="w-16 h-16 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-3 w-1/3 mt-2" />
    </div>
  );
}
