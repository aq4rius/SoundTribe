'use client';

import CreateArtistProfile from '@/components/profile/create-artist-profile';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function CreateArtistPage() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create Artist Profile</CardTitle>
            <CardDescription>Set up your professional artist profile to start connecting with events and organizers</CardDescription>
          </CardHeader>
          <CardContent>
            <CreateArtistProfile />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
