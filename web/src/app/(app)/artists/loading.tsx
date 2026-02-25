import { ArtistCardSkeleton } from '@/components/shared/skeletons';

export default function ArtistsLoading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="animate-pulse h-8 w-48 bg-white/10 rounded mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: 9 }).map((_, i) => (
          <ArtistCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
