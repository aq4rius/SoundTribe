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

const SOCIAL_ICONS: Record<string, { icon: string; color: string }> = {
  instagram: {
    color: 'hover:text-pink-400 hover:border-pink-500',
    icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z',
  },
  youtube: {
    color: 'hover:text-red-400 hover:border-red-500',
    icon: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
  },
  soundcloud: {
    color: 'hover:text-orange-400 hover:border-orange-500',
    icon: 'M1.175 12.225c-.015 0-.023.01-.024.025l-.315 2.098.315 2.068c.001.014.01.024.024.024.014 0 .023-.01.024-.024l.363-2.068-.363-2.098c-.001-.014-.01-.025-.024-.025zm-.899.828c-.019 0-.031.014-.032.032l-.244 1.27.244 1.243c.001.017.013.032.032.032.019 0 .031-.015.032-.032l.276-1.243-.276-1.27c-.001-.018-.013-.032-.032-.032zm9.13-5.801c-.056 0-.104.016-.15.04C8.95 5.822 7.786 5.2 6.497 5.2c-.357 0-.7.06-1.02.17-.35.12-.6.297-.738.51-.025.038-.033.08-.034.12l-.031 8.46.032.063c.003.014.014.024.028.025h6.96c.016-.001.027-.013.028-.028l.024-1.04.028-1.05v-.108c0-1.43-1.157-2.588-2.587-2.588-.03 0-.06.002-.089.003zm3.636 1.025c-.234 0-.45.056-.64.155-.08-1.64-1.428-2.952-3.093-2.952-.18 0-.355.017-.524.05V16.41h7.77c.89 0 1.61-.72 1.61-1.61 0-.89-.72-1.61-1.61-1.61-.085 0-.168.007-.249.02.044-.175.068-.359.068-.548 0-1.239-1.004-2.244-2.243-2.244-.03 0-.059.001-.089.003z',
  },
  tiktok: {
    color: 'hover:text-white hover:border-white',
    icon: 'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z',
  },
  facebook: {
    color: 'hover:text-blue-400 hover:border-blue-500',
    icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
  },
  twitter: {
    color: 'hover:text-sky-400 hover:border-sky-500',
    icon: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.213 5.567zm-1.161 17.52h1.833L7.084 4.126H5.117z',
  },
};

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
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-fuchsia-50 to-purple-100 dark:from-fuchsia-950 dark:to-zinc-900">
                <svg viewBox="0 0 24 24" className="w-24 h-24 text-fuchsia-300 dark:text-fuchsia-700 fill-current" aria-hidden="true">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                </svg>
              </div>
            )}
          </div>
          {/* Stat pills */}
          <div className="flex justify-center gap-3">
            <span className="text-sm font-semibold text-muted-foreground border border-border rounded-full px-4 py-1">
              0 Followers
            </span>
            <span className="text-sm font-semibold text-muted-foreground border border-border rounded-full px-4 py-1">
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
                  {defined.map(([platform, url]) => {
                    const meta = SOCIAL_ICONS[platform];
                    return (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border text-xs font-medium transition-colors capitalize ${meta?.color ?? 'hover:text-fuchsia-400 hover:border-fuchsia-500'}`}
                        aria-label={platform}
                      >
                        {meta && (
                          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current flex-shrink-0" aria-hidden="true">
                            <path d={meta.icon} />
                          </svg>
                        )}
                        {platform}
                      </a>
                    );
                  })}
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
            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
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
