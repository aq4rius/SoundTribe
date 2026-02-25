import { Skeleton } from '@/components/ui/skeleton';

export function ApplicationCardSkeleton() {
  return (
    <div className="rounded-lg shadow p-6 border border-white/10 bg-white/[0.02]">
      <div className="flex justify-between items-start">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <Skeleton className="h-4 w-full mt-4" />
      <Skeleton className="h-4 w-2/3 mt-2" />
      <Skeleton className="h-4 w-1/4 mt-4" />
    </div>
  );
}
