import { FC } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface ArtistCardArtist {
  id: string;
  stageName: string;
  location?: string | null;
  biography?: string | null;
  profileImage?: string | null;
  instruments?: string[];
  yearsOfExperience?: number;
  genres?: { id: string; name: string }[];
  user?: { username: string; profileImage: string | null };
}

interface ArtistCardProps {
  artist: ArtistCardArtist;
  mode?: 'compact' | 'full';
}

const ArtistCard: FC<ArtistCardProps> = ({ artist, mode = 'compact' }) => {
  const {
    id,
    stageName,
    profileImage,
    biography,
    instruments = [],
    yearsOfExperience = 0,
    genres = [],
    user,
  } = artist;

  const tagline = biography
    ? biography.length > 55
      ? biography.slice(0, 55) + '…'
      : biography
    : null;

  const genreString = genres
    .map((g) => g.name)
    .join(', ')
    .slice(0, 40);

  const username = user?.username ?? '';
  const userAvatar = user?.profileImage ?? null;
  const initials = username ? username[0].toUpperCase() : '?';

  if (mode === 'full') {
    return (
      <div className="rounded-xl bg-gradient-to-br from-black/80 to-fuchsia-900/40 shadow-lg p-6 border border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-fuchsia-500 to-cyan-400 flex items-center justify-center text-2xl font-bold text-white overflow-hidden">
            {profileImage ? (
              <Image src={profileImage} alt={stageName} width={64} height={64} className="w-full h-full object-cover" />
            ) : (
              <span>{stageName[0] ?? '?'}</span>
            )}
          </div>
          <div>
            <div className="font-bold text-lg text-white">{stageName}</div>
            {username && <div className="text-sm text-white/60">@{username}</div>}
          </div>
        </div>
        {biography && <div className="mt-3 text-white/80 text-sm">{biography}</div>}
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <Card className="overflow-hidden hover:shadow-xl hover:shadow-fuchsia-900/20 transition-shadow duration-200">
        {/* Thumbnail */}
        <div className="relative aspect-[4/3] rounded-t-xl overflow-hidden">
          {profileImage ? (
            <Image src={profileImage} alt={stageName} fill className="object-cover" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-fuchsia-900 to-zinc-900" />
          )}
          {/* Tagline banner */}
          {tagline && (
            <span className="absolute top-3 left-3 right-3 bg-fuchsia-700/85 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full truncate block">
              {tagline}
            </span>
          )}
        </div>

        <CardContent className="p-4 space-y-3">
          {/* Row 1 — Name + username */}
          <div>
            <p className="font-bold text-base leading-tight">{stageName}</p>
            {username && <p className="text-sm text-muted-foreground">@{username}</p>}
          </div>

          {/* Row 2 — Skill tags */}
          {instruments.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {instruments.slice(0, 3).map((inst) => (
                <Badge key={inst} className="bg-fuchsia-700 text-white text-xs">{inst}</Badge>
              ))}
              {instruments.length > 3 && (
                <Badge variant="secondary">+{instruments.length - 3} more</Badge>
              )}
            </div>
          )}

          {/* Row 3 — Meta info */}
          <div className="space-y-0.5">
            {yearsOfExperience > 0 && (
              <p className="text-xs text-muted-foreground">🎯 {yearsOfExperience} yrs exp</p>
            )}
            {genreString && (
              <p className="text-xs text-muted-foreground">🎵 {genreString}</p>
            )}
          </div>

          {/* Row 4 — Action row */}
          <div className="flex items-center justify-between pt-1">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/artists/${id}`}>See profile</Link>
            </Button>
            <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
              {userAvatar ? (
                <Image src={userAvatar} alt={username} fill className="object-cover" sizes="32px" />
              ) : (
                <div className="w-full h-full bg-fuchsia-600 text-white text-xs font-bold flex items-center justify-center">
                  {initials}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ArtistCard;
