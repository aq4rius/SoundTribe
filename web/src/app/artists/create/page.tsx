// Artists Create Page
'use client';

import CreateArtistProfile from '@/components/profile/CreateArtistProfile';

export default function CreateArtistPage() {
  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4 text-black">Create Artist Profile</h1>
      {/* TODO: Add artist profile creation form here */}
      <div className="bg-white/90 rounded-lg shadow p-6 border border-gray-200 text-black">
        <CreateArtistProfile />
      </div>
    </div>
  );
}
