// Edit Artist Profile Page
'use client';

import { useRouter } from 'next/navigation';

export default function EditArtistProfilePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  // TODO: Fetch artist profile by params.id and render edit form
  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4 text-white">Edit Artist Profile</h1>
      {/* TODO: Implement artist profile edit form */}
      <div className="bg-black/80 rounded-lg shadow p-6 border border-fuchsia-900 text-white">
        Artist profile edit form coming soon.
      </div>
    </div>
  );
}
