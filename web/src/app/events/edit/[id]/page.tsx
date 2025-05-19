// Edit Event Page
'use client';

import { useRouter } from 'next/navigation';

export default function EditEventPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  // TODO: Fetch event by params.id and render edit form
  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4 text-white">Edit Event</h1>
      {/* TODO: Implement event edit form */}
      <div className="bg-black/80 rounded-lg shadow p-6 border border-cyan-900 text-white">
        Event edit form coming soon.
      </div>
    </div>
  );
}
