// Artist details page for /artists/[id]
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MessageSquare } from 'lucide-react';
import ArtistCard from '@/components/artists/artist-card';
import { Button } from '@/components/ui/button';
import { getArtistProfileByIdAction } from '@/actions/artist-profiles';
import { auth } from '@/lib/auth';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const result = await getArtistProfileByIdAction(id);
  if (!result.success || !result.data) {
    return { title: 'Artist Not Found | SoundTribe' };
  }
  const artist = result.data;
  return {
    title: `${artist.stageName} | SoundTribe`,
    description: artist.biography
      ? artist.biography.slice(0, 160)
      : `Artist profile for ${artist.stageName}`,
  };
}

export default async function ArtistDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (id === 'create') return notFound();
  const [result, session] = await Promise.all([getArtistProfileByIdAction(id), auth()]);
  if (!result.success || !result.data) return notFound();
  const artist = result.data;
  const canMessage = session?.user && session.user.id !== artist.userId;
  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-6">
        <ArtistCard artist={artist} mode="full" />
      </div>
      <div className="bg-black/60 rounded-xl p-6 border border-white/10 mb-6">
        <h2 className="text-xl font-bold mb-2 text-fuchsia-400">Artist Details</h2>
        <div className="space-y-2 text-white/90">
          <div>
            <span className="font-semibold">Stage Name:</span> {artist.stageName}
          </div>
          <div>
            <span className="font-semibold">Biography:</span>{' '}
            {artist.biography || 'No bio provided.'}
          </div>
          <div>
            <span className="font-semibold">Location:</span> {artist.location}
          </div>
          <div>
            <span className="font-semibold">Genres:</span>{' '}
            {Array.isArray(artist.genres)
              ? artist.genres.map((g: { id: string; name: string }) => g.name).join(', ')
              : ''}
          </div>
          <div>
            <span className="font-semibold">Instruments:</span>{' '}
            {Array.isArray(artist.instruments) ? artist.instruments.join(', ') : ''}
          </div>
          <div>
            <span className="font-semibold">Years of Experience:</span> {artist.yearsOfExperience}
          </div>
          {artist.websiteUrl && (
            <div>
              <span className="font-semibold">Website:</span>{' '}
              <a
                href={artist.websiteUrl}
                className="text-cyan-400 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {artist.websiteUrl}
              </a>
            </div>
          )}
          {artist.socialMediaLinks && (
            <div>
              <span className="font-semibold">Socials:</span>{' '}
              {Object.entries(artist.socialMediaLinks).map(([platform, url]) => {
                if (typeof url !== 'string' || !url) return null;
                const safeUrl =
                  url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
                return (
                  <a
                    key={platform}
                    href={safeUrl}
                    className="ml-2 text-cyan-400 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {platform}
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-4 mb-6">
        {canMessage && (
          <Button variant="outline" size="sm" asChild>
            <Link href={`/chat?recipientId=${artist.id}&recipientType=artist_profile`}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Message
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
