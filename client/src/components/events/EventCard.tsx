import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Event } from '../../types';

interface EventCardProps {
  event: Event;
  onDelete: (id: string) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onDelete }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-semibold">{event.title}</h3>
          <p className="text-gray-600 mt-1">{event.location}</p>
        </div>
        <div className="space-x-2">
          <button
            onClick={() => navigate(`/edit-event/${event._id}`)}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(event._id)}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <p className="text-gray-700">{event.description}</p>
        <div className="flex space-x-4 text-sm text-gray-600">
          <span>Date: {new Date(event.eventDate).toLocaleDateString()}</span>
          <span>Duration: {event.duration} hours</span>
          <span>Payment: ${event.paymentAmount} ({event.paymentType})</span>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {event.genres.map(genre => (
            <span key={genre._id} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {genre.name}
            </span>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {event.requiredInstruments.map((instrument, index) => (
            <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              {instrument}
            </span>
          ))}
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <p>Required Experience: {event.requiredExperience} years</p>
          <p>Application Deadline: {new Date(event.applicationDeadline).toLocaleDateString()}</p>
          <p>Status: <span className="capitalize">{event.status}</span></p>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
