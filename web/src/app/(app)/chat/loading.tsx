import { ConversationItemSkeleton } from '@/components/shared/skeletons';
import { Skeleton } from '@/components/ui/skeleton';

export default function ChatLoading() {
  return (
    <div className="flex h-[calc(100vh-6rem)]">
      {/* Sidebar */}
      <div className="w-80 border-r border-white/10 p-4 space-y-3">
        <Skeleton className="h-10 w-full rounded-lg" />
        {Array.from({ length: 8 }).map((_, i) => (
          <ConversationItemSkeleton key={i} />
        ))}
      </div>
      {/* Main area */}
      <div className="flex-1 flex items-center justify-center">
        <Skeleton className="h-5 w-48" />
      </div>
    </div>
  );
}
