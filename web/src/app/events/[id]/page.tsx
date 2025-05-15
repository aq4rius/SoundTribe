// Event details page for /events/[id]
import { notFound } from 'next/navigation';
import EventCard from '@/components/events/EventCard';
import Link from 'next/link';

async function getEvent(id: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/event-postings/${id}`,
  );
  if (!res.ok) return null;
  return res.json();
}

export default async function EventDetailsPage({ params }: { params: { id: string } }) {
  const event = await getEvent(params.id);
  if (!event) return notFound();
  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-6">
        <EventCard event={event} mode="full" />
      </div>
      <div className="bg-black/60 rounded-xl p-6 border border-white/10 mb-6">
        <h2 className="text-xl font-bold mb-2 text-cyan-300">Event Details</h2>
        <div className="space-y-2 text-white/90">
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
            {Array.isArray(event.genres) ? event.genres.map((g: any) => g.name).join(', ') : ''}
          </div>
          <div>
            <span className="font-semibold">Required Instruments:</span>{' '}
            {Array.isArray(event.requiredInstruments) ? event.requiredInstruments.join(', ') : ''}
          </div>
          <div>
            <span className="font-semibold">Payment:</span> {event.paymentAmount} (
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
            {event.postedBy?.username || event.postedBy?.email || 'Unknown'}
          </div>
        </div>
      </div>
      <div className="flex gap-4 mb-6">
        {/* Placeholder for Send Message and Apply actions */}
        <button className="px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-700 text-white font-semibold transition">
          Send Message
        </button>
        <button className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition">
          Apply
        </button>
      </div>
      {/* TODO: Integrate chat and application components here */}
    </div>
  );
}
