// client/src/components/artists/ArtistDetails.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getArtistProfileById } from '../../services/artistProfile';
import { ArtistProfile } from '../../types';
import ErrorAlert from '../common/ErrorAlert';
import { useAuth } from '../../hooks/useAuth';

const ArtistDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [artist, setArtist] = useState<ArtistProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArtist = async () => {
      try {
        if (id) {
          const data = await getArtistProfileById(id);
          setArtist(data);
        }
      } catch (err) {
        setError('Failed to load artist profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchArtist();
  }, [id]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <ErrorAlert message={error} />;
  if (!artist) return <div>Artist not found</div>;

  // Check if this is the current user's own profile
  const isOwnProfile = user && (
    (typeof artist.user === 'string' && artist.user === user._id) ||
    (typeof artist.user === 'object' && artist.user._id === user._id)
  );

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-base-100 rounded-lg shadow-lg p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-primary">{artist.stageName}</h1>
            <p className="text-base-content mt-2">{artist.location}</p>
          </div>
          {artist.profileImage && (
            <img
              src={artist.profileImage}
              alt={artist.stageName}
              className="w-32 h-32 rounded-full object-cover"
            />
          )}
        </div>
        <div className="mb-4 text-right">
          {!isOwnProfile && (
            <button
              className="btn btn-primary"
              onClick={() => navigate(`/chat?targetId=${artist._id}&targetType=ArtistProfile&targetName=${encodeURIComponent(artist.stageName)}`)}
            >
              Send Message
            </button>
          )}
        </div>
        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-primary mb-2">About</h2>
            <p className="text-base-content">{artist.biography || 'No biography provided'}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-2">Genres</h2>
            <div className="flex flex-wrap gap-2">
              {artist.genres.map(genre => (
                <span
                  key={genre._id}
                  className="px-3 py-1 bg-secondary text-secondary-content rounded-full"
                >
                  {genre.name}
                </span>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-primary mb-2">Experience & Skills</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-base-content">Years of Experience</p>
                <p className="font-medium">{artist.yearsOfExperience} years</p>
              </div>
              <div>
                <p className="text-base-content">Rate</p>
                <p className="font-medium">${artist.ratePerHour}/hour</p>
              </div>
              <div className="col-span-2">
                <p className="text-base-content">Instruments</p>
                <p className="font-medium">{artist.instruments.join(', ')}</p>
              </div>
            </div>
          </section>

          {artist.socialMediaLinks && (
            <section>
              <h2 className="text-xl font-semibold text-primary mb-2">Social Media</h2>
              <div className="flex gap-4">
                {artist.socialMediaLinks.facebook && (
                  <a href={artist.socialMediaLinks.facebook} target="_blank" rel="noopener noreferrer" className="link link-primary">Facebook</a>
                )}
                {artist.socialMediaLinks.instagram && (
                  <a href={artist.socialMediaLinks.instagram} target="_blank" rel="noopener noreferrer" className="link link-primary">Instagram</a>
                )}
                {artist.socialMediaLinks.twitter && (
                  <a href={artist.socialMediaLinks.twitter} target="_blank" rel="noopener noreferrer" className="link link-primary">Twitter</a>
                )}
                {artist.socialMediaLinks.youtube && (
                  <a href={artist.socialMediaLinks.youtube} target="_blank" rel="noopener noreferrer" className="link link-primary">YouTube</a>
                )}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArtistDetails;
