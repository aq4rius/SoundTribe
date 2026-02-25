import { Skeleton } from '@/components/ui/skeleton';

export function ArtistCardSkeleton() {
  return (
    <div className="rounded-xl bg-gradient-to-br from-black/80 to-fuchsia-900/40 shadow-lg p-6 flex flex-col gap-2 border border-white/10">
      <div className="flex items-center gap-4">
        <Skeleton className="w-16 h-16 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    </div>
  );
}
