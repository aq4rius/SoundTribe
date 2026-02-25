import { FC } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface ArtistCardArtist {
  id: string;
  stageName: string;
  location?: string | null;
  biography?: string | null;
  profileImage?: string | null;
}

interface ArtistCardProps {
  artist: ArtistCardArtist;
  mode?: 'compact' | 'full';
}

const ArtistCard: FC<ArtistCardProps> = ({ artist, mode = 'compact' }) => {
  const cardContent = (
    <div className="rounded-xl bg-gradient-to-br from-black/80 to-fuchsia-900/40 shadow-lg p-6 flex flex-col gap-2 hover:scale-[1.02] transition-transform duration-200 border border-white/10 cursor-pointer">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-fuchsia-500 to-cyan-400 flex items-center justify-center text-2xl font-bold text-white">
          {/* Placeholder for avatar */}
          {artist.profileImage ? (
            <Image
              src={artist.profileImage}
              alt={artist.stageName}
              width={64}
              height={64}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            (artist.stageName && artist.stageName[0]) || '?' // Defensive for undefined
          )}
        </div>
        <div>
          <div className="font-bold text-lg text-white">{artist.stageName || 'Unknown'}</div>
          <div className="text-sm text-white/60">{artist.location || 'Location unknown'}</div>
        </div>
      </div>
      {mode === 'full' && (
        <div className="mt-2 text-white/80 text-sm">{artist.biography || 'No bio provided.'}</div>
      )}
    </div>
  );
  if (mode === 'full') return cardContent;
  return <Link href={`/artists/${artist.id}`}>{cardContent}</Link>;
};

export default ArtistCard;
