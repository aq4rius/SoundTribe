// Artist details page for /artists/[id]
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { MessageSquare, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getArtistProfileByIdAction } from '@/actions/artist-profiles';
import { auth } from '@/lib/auth';

function toSpotifyEmbedUrl(url: string): string {
  // Converts https://open.spotify.com/track/ID to https://open.spotify.com/embed/track/ID
  // Also handles already-converted embed URLs gracefully
  return url.replace('open.spotify.com/', 'open.spotify.com/embed/');
}

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
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-10">

      {/* ── Top two-column section ── */}
      <div className="grid grid-cols-1 md:grid-cols-[2fr_3fr] gap-8 md:gap-12">

        {/* LEFT — photo + stats */}
        <div className="flex flex-col gap-4">
          <div className="relative aspect-square rounded-xl overflow-hidden">
            {artist.profileImage ? (
              <Image
                src={artist.profileImage}
                alt={artist.stageName}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 40vw"
                priority
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-fuchsia-900 to-zinc-900" />
            )}
          </div>
          {/* Stat pills */}
          <div className="flex justify-center gap-3">
            <span className="text-sm font-semibold text-muted-foreground border border-white/10 rounded-full px-4 py-1">
              0 Followers
            </span>
            <span className="text-sm font-semibold text-muted-foreground border border-white/10 rounded-full px-4 py-1">
              0 Connections
            </span>
          </div>
        </div>

        {/* RIGHT — profile info */}
        <div className="flex flex-col gap-5">
          <div>
            <h1 className="text-3xl font-bold">{artist.stageName}</h1>
            {artist.location && (
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                <MapPin className="h-3.5 w-3.5" />
                {artist.location}
              </p>
            )}
          </div>

          {/* Message button */}
          {canMessage && (
            <div>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/chat?recipientId=${artist.id}&recipientType=artist_profile`}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message
                </Link>
              </Button>
            </div>
          )}

          {/* Skills */}
          {Array.isArray(artist.instruments) && artist.instruments.length > 0 && (
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Skills
              </p>
              <div className="flex flex-wrap gap-2">
                {artist.instruments.map((instrument: string) => (
                  <Badge key={instrument} className="bg-fuchsia-700 text-white">
                    {instrument}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Genres */}
          {Array.isArray(artist.genres) && artist.genres.length > 0 && (
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Genres
              </p>
              <div className="flex flex-wrap gap-2">
                {artist.genres.map((genre: { id: string; name: string }) => (
                  <Badge key={genre.id} variant="outline">
                    {genre.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Social links */}
          {artist.socialMediaLinks && (() => {
            const links = artist.socialMediaLinks as Record<string, string>;
            const defined = Object.entries(links).filter(([, v]) => v && v.length > 0);
            if (defined.length === 0) return null;
            return (
              <div className="space-y-2">
                <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Links</p>
                <div className="flex flex-wrap gap-3">
                  {defined.map(([platform, url]) => (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/20 text-xs font-medium hover:border-fuchsia-500 hover:text-fuchsia-400 transition-colors capitalize"
                    >
                      {platform}
                    </a>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Years of experience */}
          {artist.yearsOfExperience > 0 && (
            <p className="text-sm text-muted-foreground">
              🎯 {artist.yearsOfExperience} years of experience
            </p>
          )}
        </div>
      </div>

      {/* ── About section ── */}
      {artist.biography && (
        <>
          <Separator />
          <div>
            <h2 className="text-lg font-semibold mb-3">About</h2>
            <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
              {artist.biography}
            </p>
          </div>
        </>
      )}

      {artist.spotifyTrackUrl && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Tracks</h2>
          <iframe
            src={toSpotifyEmbedUrl(artist.spotifyTrackUrl)}
            width="100%"
            height="152"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="rounded-xl border-0"
            title="Spotify track preview"
          />
        </section>
      )}

    </div>
  );
}
