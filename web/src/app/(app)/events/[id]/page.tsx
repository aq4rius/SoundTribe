// Event details page for /events/[id]
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import EventCard from '@/components/events/event-card';
import EventApplication from '@/components/applications/event-application';
import { getEventByIdAction } from '@/actions/events';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const result = await getEventByIdAction(id);
  if (!result.success || !result.data) {
    return { title: 'Event Not Found | SoundTribe' };
  }
  const event = result.data;
  return {
    title: `${event.title} | SoundTribe`,
    description: event.description
      ? event.description.slice(0, 160)
      : `Event in ${event.location || 'an unknown location'}`,
  };
}

export default async function EventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (id === 'create') return notFound();
  const result = await getEventByIdAction(id);
  if (!result.success || !result.data) return notFound();
  const event = result.data;

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-6">
        <EventCard event={event} mode="full" />
      </div>

      <div className="bg-black/5 dark:bg-black/60 rounded-xl p-6 border border-border mb-6">
        <h2 className="text-xl font-bold mb-2 text-cyan-600 dark:text-cyan-300">Event Details</h2>
        <div className="space-y-2 text-foreground">
          <div>
            <span className="font-semibold">Title:</span> {event.title}
          </div>
          <div>
            <span className="font-semibold">Description:</span> {event.description}
          </div>
          <div>
            <span className="font-semibold">Location:</span> {event.location}
          </div>
          <div>
            <span className="font-semibold">Date:</span>{' '}
            {event.eventDate ? new Date(event.eventDate).toISOString().slice(0, 10) : 'Unknown'}
          </div>
          <div>
            <span className="font-semibold">Duration:</span> {event.duration} hours
          </div>
          <div>
            <span className="font-semibold">Genres:</span>{' '}
            {Array.isArray(event.genres) ? event.genres.map((g: { name: string }) => g.name).join(', ') : ''}
          </div>
          <div>
            <span className="font-semibold">Required Instruments:</span>{' '}
            {Array.isArray(event.requiredInstruments) ? event.requiredInstruments.join(', ') : ''}
          </div>
          <div>
            <span className="font-semibold">Payment:</span> {String(event.paymentAmount)} (
            {event.paymentType})
          </div>
          <div>
            <span className="font-semibold">Required Experience:</span> {event.requiredExperience}{' '}
            years
          </div>
          <div>
            <span className="font-semibold">Application Deadline:</span>{' '}
            {event.applicationDeadline
              ? new Date(event.applicationDeadline).toISOString().slice(0, 10)
              : 'Unknown'}
          </div>
          <div>
            <span className="font-semibold">Status:</span> {event.status}
          </div>
          <div>
            <span className="font-semibold">Posted By:</span>{' '}
            {event.organizer?.username || event.organizer?.email || 'Unknown'}
          </div>
        </div>
      </div>

      <EventApplication eventId={event.id} organizerId={event.organizerId} status={event.status} />
    </div>
  );
}
