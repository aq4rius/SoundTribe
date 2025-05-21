// Edit Artist Profile Page
'use client';

import { useRouter } from 'next/navigation';
import EditArtistProfile from '@/components/profile/EditArtistProfile';

export default function EditArtistProfilePage({ params }: { params: { id: string } }) {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4 text-white">Edit Artist Profile</h1>
      <div className="bg-black/80 rounded-lg shadow p-6 border border-fuchsia-900 text-white">
        <EditArtistProfile artistId={params.id} />
      </div>
    </div>
  );
}
