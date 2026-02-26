'use client';

import EventForm from '@/components/events/event-form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function CreateEventPage() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create Event</CardTitle>
            <CardDescription>Post a new event to find talented artists</CardDescription>
          </CardHeader>
          <CardContent>
            <EventForm mode="create" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
