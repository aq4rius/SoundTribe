import { Skeleton } from '@/components/ui/skeleton';
import { EventCardSkeleton } from './event-card-skeleton';
import { ArtistCardSkeleton } from './artist-card-skeleton';
import { ApplicationCardSkeleton } from './application-card-skeleton';

export function DashboardSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
      {/* User info */}
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 space-y-4">
        <Skeleton className="h-7 w-1/3" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>

      {/* Events section */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <EventCardSkeleton />
          <EventCardSkeleton />
        </div>
      </div>

      {/* Artist profile section */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-40" />
        <ArtistCardSkeleton />
      </div>

      {/* Applications section */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-44" />
        <ApplicationCardSkeleton />
        <ApplicationCardSkeleton />
      </div>
    </div>
  );
}
