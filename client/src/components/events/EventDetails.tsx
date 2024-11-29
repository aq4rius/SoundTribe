import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getEventById } from '../../services/event';
import { Event } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import EventApplication from '../applications/EventApplication';

const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  if (error) return <div className="text-red-500">{error}</div>;
  if (!event) return <div>Event not found</div>;

  const isEventOwner = user && event.postedBy && user.email === event.postedBy.email;


  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-4">{event.title}</h1>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Event Details</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Location:</span> {event.location}</p>
              <p><span className="font-medium">Date:</span> {new Date(event.eventDate).toLocaleDateString()}</p>
              <p><span className="font-medium">Duration:</span> {event.duration} hours</p>
              <p><span className="font-medium">Payment:</span> ${event.paymentAmount} ({event.paymentType})</p>
              <p><span className="font-medium">Status:</span> <span className="capitalize">{event.status}</span></p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Requirements</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Experience:</span> {event.requiredExperience} years</p>
              <p><span className="font-medium">Application Deadline:</span> {new Date(event.applicationDeadline).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Description</h2>
          <p className="text-gray-700">{event.description}</p>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Required Instruments</h2>
          <div className="flex flex-wrap gap-2">
            {event.requiredInstruments.map((instrument, index) => (
              <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-full">
                {instrument}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Genres</h2>
          <div className="flex flex-wrap gap-2">
            {event.genres.map(genre => (
              <span key={genre._id} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
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
