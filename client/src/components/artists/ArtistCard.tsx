import React from 'react';
import { ArtistProfile } from '../../types';

interface ArtistCardProps {
  artist: ArtistProfile;
}

const ArtistCard: React.FC<ArtistCardProps> = ({ artist }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">{artist.stageName}</h3>
          <p className="text-gray-600">{artist.location}</p>
        </div>
        {artist.profileImage && (
          <img 
            src={artist.profileImage} 
            alt={artist.stageName}
            className="w-16 h-16 rounded-full object-cover"
          />
        )}
      </div>
      
      <p className="text-sm mt-2 text-gray-700">
        {artist.biography ? artist.biography.slice(0, 150) + '...' : 'No biography provided'}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {artist.genres.map(genre => (
          <span 
            key={genre._id} 
            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
          >
            {genre.name}
          </span>
        ))}
      </div>

      <div className="mt-4 space-y-1">
        <p className="text-sm text-gray-600">Experience: {artist.yearsOfExperience} years</p>
        {artist.ratePerHour && (
          <p className="text-sm text-gray-600">Rate: ${artist.ratePerHour}/hour</p>
        )}
        {artist.instruments.length > 0 && (
          <p className="text-sm text-gray-600">
            Instruments: {artist.instruments.join(', ')}
          </p>
        )}
      </div>
    </div>
  );
};

export default ArtistCard;
