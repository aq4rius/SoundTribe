// client/src/components/events/EventDetails.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventById } from '../../services/event';
import { Event } from '../../types';
import EventApplication from '../applications/EventApplication';
import ErrorAlert from '../common/ErrorAlert';
import { useAuth } from '../../hooks/useAuth';

const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        if (id) {
          const data = await getEventById(id);
          setEvent(data);
        }
      } catch (err) {
        setError('Failed to load event details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <ErrorAlert message={error} />;
  if (!event) return <div>Event not found</div>;

  // Check if this is the current user's own event
  const isOwnEvent = user && (
    (typeof event.postedBy === 'string' && event.postedBy === user._id) ||
    (typeof event.postedBy === 'object' && event.postedBy._id === user._id)
  );

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-base-100 rounded-lg shadow-lg p-6">
        <div className="flex items-start justify-between mb-6">
          <h1 className="text-3xl font-bold mb-4 text-primary">{event.title}</h1>
          {!isOwnEvent && (
            <button
              className="btn btn-primary"
              onClick={() => navigate(`/chat?targetId=${event._id}&targetType=Event&targetName=${encodeURIComponent(event.title)}`)}
            >
              Send Message
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-2 text-primary">Event Details</h2>
            <div className="space-y-2 text-base-content">
              <p><span className="font-medium">Location:</span> {event.location}</p>
              <p><span className="font-medium">Date:</span> {new Date(event.eventDate).toLocaleDateString()}</p>
              <p><span className="font-medium">Duration:</span> {event.duration} hours</p>
              <p><span className="font-medium">Payment:</span> ${event.paymentAmount} ({event.paymentType})</p>
              <p><span className="font-medium">Status:</span> <span className="capitalize">{event.status}</span></p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2 text-primary">Requirements</h2>
            <div className="space-y-2 text-base-content">
              <p><span className="font-medium">Experience:</span> {event.requiredExperience} years</p>
              <p><span className="font-medium">Application Deadline:</span> {new Date(event.applicationDeadline).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2 text-primary">Description</h2>
          <p className="text-base-content">{event.description}</p>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2 text-primary">Required Instruments</h2>
          <div className="flex flex-wrap gap-2">
            {event.requiredInstruments.map((instrument, index) => (
              <span key={index} className="px-3 py-1 bg-base-200 text-base-content rounded-full">
                {instrument}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2 text-primary">Genres</h2>
          <div className="flex flex-wrap gap-2">
            {event.genres.map(genre => (
              <span key={genre._id} className="px-3 py-1 bg-base-200 text-base-content rounded-full">
                {genre.name}
              </span>
            ))}
          </div>
        </div>
      
      </div>
      <div className="mt-8">
          <EventApplication event={event} />
        </div>
    </div>
  );
};

export default EventDetails;
