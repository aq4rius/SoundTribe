// Events Create Page
'use client';

import CreateEventForm from '@/components/events/create-event-form';

export default function CreateEventPage() {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4 text-black dark:text-white">Create Event</h1>
      <div className="bg-white/90 dark:bg-zinc-900 rounded-lg shadow p-6 border border-gray-200 dark:border-zinc-700 text-black dark:text-white">
        <CreateEventForm />
      </div>
    </div>
  );
}
