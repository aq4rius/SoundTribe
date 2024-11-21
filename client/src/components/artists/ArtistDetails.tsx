import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getArtistProfileById } from '../../services/artistProfile';
import { ArtistProfile } from '../../types';

const ArtistDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [artist, setArtist] = useState<ArtistProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  if (error) return <div className="text-red-500">{error}</div>;
  if (!artist) return <div>Artist not found</div>;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">{artist.stageName}</h1>
            <p className="text-gray-600 mt-2">{artist.location}</p>
          </div>
          {artist.profileImage && (
            <img
              src={artist.profileImage}
              alt={artist.stageName}
              className="w-32 h-32 rounded-full object-cover"
            />
          )}
        </div>

        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-2">About</h2>
            <p className="text-gray-700">{artist.biography || 'No biography provided'}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">Genres</h2>
            <div className="flex flex-wrap gap-2">
              {artist.genres.map(genre => (
                <span
                  key={genre._id}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full"
                >
                  {genre.name}
                </span>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">Experience & Skills</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Years of Experience</p>
                <p className="font-medium">{artist.yearsOfExperience} years</p>
              </div>
              <div>
                <p className="text-gray-600">Rate</p>
                <p className="font-medium">${artist.ratePerHour}/hour</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-600">Instruments</p>
                <p className="font-medium">{artist.instruments.join(', ')}</p>
              </div>
            </div>
          </section>

          {artist.socialMediaLinks && (
            <section>
              <h2 className="text-xl font-semibold mb-2">Social Media</h2>
              <div className="flex gap-4">
                {artist.socialMediaLinks.facebook && (
                  <a href={artist.socialMediaLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">Facebook</a>
                )}
                {artist.socialMediaLinks.instagram && (
                  <a href={artist.socialMediaLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">Instagram</a>
                )}
                {artist.socialMediaLinks.twitter && (
                  <a href={artist.socialMediaLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">Twitter</a>
                )}
                {artist.socialMediaLinks.youtube && (
                  <a href={artist.socialMediaLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">YouTube</a>
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
