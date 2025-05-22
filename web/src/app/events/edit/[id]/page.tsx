// Edit Event Page
'use client';

import { useRouter, useParams } from 'next/navigation';
import EditEventForm from '@/components/events/EditEventForm';

export default function EditEventPage() {
  const params = useParams();
  const eventId = Array.isArray(params.id) ? params.id[0] : params.id;
  if (!eventId) return <div className="text-red-500">Invalid event ID</div>;
  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4 text-white">Edit Event</h1>
      <div className="bg-black/80 rounded-lg shadow p-6 border border-cyan-900 text-white">
        <EditEventForm eventId={eventId as string} />
      </div>
    </div>
  );
}
