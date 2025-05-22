// Artist details page for /artists/[id]
import { notFound } from 'next/navigation';
import ArtistCard from '@/components/artists/ArtistCard';
import Link from 'next/link';

async function getArtist(id: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/artist-profiles/${id}`,
  );
  if (!res.ok) return null;
  return res.json();
}

export default async function ArtistDetailsPage({ params }: { params: { id: string } }) {
  if (params.id === 'create') return notFound();
  const artist = await getArtist(params.id);
  if (!artist) return notFound();
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
            {Array.isArray(artist.genres) ? artist.genres.map((g: any) => g.name).join(', ') : ''}
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
                const safeUrl = url.startsWith('http://') || url.startsWith('https://')
                  ? url
                  : `https://${url}`;
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
        {/* Placeholder for Send Message action */}
        <button className="px-4 py-2 rounded bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-semibold transition">
          Send Message
        </button>
      </div>
      {/* TODO: Integrate chat and other artist actions here */}
    </div>
  );
}
