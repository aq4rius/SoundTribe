// client/src/components/events/EventCard.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Event } from '../../types';

interface EventCardProps {
  event: Event;
  mode?: 'compact' | 'full';
  className?: string;
  onDelete?: (id: string) => void;
}

const EventCard: React.FC<EventCardProps> = ({ 
  event, 
  mode = 'compact',
  className = '',
  onDelete 
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/events/${event._id}`);
  };

  return (
    <div 
      onClick={handleClick}
      className={`bg-base-100 shadow rounded-lg p-6 mb-4 hover:shadow-lg transition-shadow cursor-pointer ${className}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-semibold text-primary">{event.title}</h3>
          <p className="text-base-content mt-1">{event.location}</p>
        </div>
        {mode === 'full' && onDelete && (
          <div className="space-x-2" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => navigate(`/edit-event/${event._id}`)}
              className="btn btn-primary btn-sm"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(event._id)}
              className="btn btn-error btn-sm"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 space-y-2">
        <p className="text-base-content">
          {mode === 'compact' 
            ? `${event.description.slice(0, 150)}...`
            : event.description
          }
        </p>
        <div className="flex space-x-4 text-sm text-base-content">
          <span>Date: {new Date(event.eventDate).toLocaleDateString()}</span>
          <span>Duration: {event.duration} hours</span>
          <span>Payment: ${event.paymentAmount} ({event.paymentType})</span>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {event.genres.map(genre => (
            <span key={genre._id} className="px-2 py-1 bg-base-200 text-base-content rounded-full text-sm">
              {genre.name}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {event.requiredInstruments.map((instrument, index) => (
            <span key={index} className="px-2 py-1 bg-base-200 text-base-content rounded-full text-sm">
              {instrument}
            </span>
          ))}
        </div>
      </div>

      {mode === 'compact' && (
        <div className="mt-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/events/${event._id}`);
            }}
            className="w-full btn btn-primary"
          >
            View Details
          </button>
        </div>
      )}
    </div>
  );
};

export default EventCard;
