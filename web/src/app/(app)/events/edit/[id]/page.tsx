'use client';

import { useParams } from 'next/navigation';
import EventForm from '@/components/events/event-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function EditEventPage() {
  const params = useParams();
  const eventId = Array.isArray(params.id) ? params.id[0] : params.id;
  if (!eventId) return <div className="text-destructive p-8">Invalid event ID</div>;
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Edit Event</CardTitle>
            <CardDescription>Update your event details</CardDescription>
          </CardHeader>
          <CardContent>
            <EventForm mode="edit" eventId={eventId as string} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
