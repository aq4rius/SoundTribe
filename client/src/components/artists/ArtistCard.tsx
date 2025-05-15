// client/src/components/artists/ArtistCard.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArtistProfile } from '../../types';

interface ArtistCardProps {
  artist: ArtistProfile;
  mode?: 'compact' | 'full';
  className?: string;
}

const ArtistCard: React.FC<ArtistCardProps> = ({ artist, mode = 'compact', className = '' }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/artists/${artist._id}`);
  };

  return (
    <div
      onClick={handleClick}
      className={`bg-base-100 p-4 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer ${className}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-primary">{artist.stageName}</h3>
          <p className="text-base-content">{artist.location}</p>
        </div>
        {artist.profileImage && (
          <img
            src={artist.profileImage}
            alt={artist.stageName}
            className="w-16 h-16 rounded-full object-cover"
          />
        )}
      </div>

      <p className="text-sm mt-2 text-base-content">
        {artist.biography
          ? artist.biography.slice(0, mode === 'compact' ? 150 : 300) + '...'
          : 'No biography provided'}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {artist.genres.map((genre) => (
          <span
            key={genre._id}
            className="px-2 py-1 bg-secondary text-secondary-content text-xs rounded-full"
          >
            {genre.name}
          </span>
        ))}
      </div>

      <div className="mt-4 space-y-1">
        <p className="text-sm text-base-content">Experience: {artist.yearsOfExperience} years</p>
        {artist.ratePerHour && (
          <p className="text-sm text-base-content">Rate: ${artist.ratePerHour}/hour</p>
        )}
        {artist.instruments.length > 0 && (
          <p className="text-sm text-base-content">Instruments: {artist.instruments.join(', ')}</p>
        )}
      </div>

      {mode === 'full' && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/artists/${artist._id}`);
          }}
          className="mt-4 w-full btn btn-primary"
        >
          View Full Profile
        </button>
      )}
    </div>
  );
};

export default ArtistCard;
