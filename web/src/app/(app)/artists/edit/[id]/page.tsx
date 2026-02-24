// Edit Artist Profile Page
'use client';

import { useRouter, useParams } from 'next/navigation';
import EditArtistProfile from '@/components/profile/edit-artist-profile';

export default function EditArtistProfilePage() {
  const params = useParams();
  const artistId = Array.isArray(params.id) ? params.id[0] : params.id;
  if (!artistId) return <div className="text-red-500">Invalid artist ID</div>;
  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4 text-white">Edit Artist Profile</h1>
      <div className="bg-black/80 rounded-lg shadow p-6 border border-fuchsia-900 text-white">
        <EditArtistProfile artistId={artistId as string} />
      </div>
    </div>
  );
}
