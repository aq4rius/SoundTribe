'use client';

import { useParams } from 'next/navigation';
import EditArtistProfile from '@/components/profile/edit-artist-profile';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function EditArtistProfilePage() {
  const params = useParams();
  const artistId = Array.isArray(params.id) ? params.id[0] : params.id;
  if (!artistId) return <div className="text-destructive p-8">Invalid artist ID</div>;
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Edit Artist Profile</CardTitle>
            <CardDescription>Update your professional artist profile</CardDescription>
          </CardHeader>
          <CardContent>
            <EditArtistProfile artistId={artistId as string} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
