import { FC } from 'react';
import Link from 'next/link';

interface EventCardEvent {
  id: string;
  title: string;
  location?: string | null;
  description?: string | null;
  eventDate?: Date | string | null;
}

interface EventCardProps {
  event: EventCardEvent;
  mode?: 'compact' | 'full';
}

const EventCard: FC<EventCardProps> = ({ event, mode = 'compact' }) => {
  const cardContent = (
    <div className="rounded-xl bg-gradient-to-br from-white to-cyan-50 dark:from-black/80 dark:to-cyan-900/40 shadow-lg p-6 flex flex-col gap-2 hover:scale-[1.02] transition-transform duration-200 border border-border cursor-pointer">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-400 to-emerald-400 flex items-center justify-center text-2xl font-bold text-white">
          {/* Placeholder for event image */}
          {(event.title && event.title[0]) || '?'}
        </div>
        <div>
          <div className="font-bold text-lg text-foreground">{event.title || 'Untitled'}</div>
          <div className="text-sm text-muted-foreground">{event.location || 'Location unknown'}</div>
        </div>
      </div>
      {mode === 'full' && (
        <div className="mt-2 text-foreground/80 text-sm">
          {event.description || 'No description provided.'}
        </div>
      )}
      <div className="mt-2 text-xs text-muted-foreground/60">
        {event.eventDate ? new Date(event.eventDate).toISOString().slice(0, 10) : 'Date unknown'}
      </div>
    </div>
  );
  if (mode === 'full') return cardContent;
  return <Link href={`/events/${event.id}`}>{cardContent}</Link>;
};

export default EventCard;
