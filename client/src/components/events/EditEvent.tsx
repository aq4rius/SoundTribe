// client/src/components/events/EditEvent.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventById, updateEvent } from '../../services/event';
import { getAllGenres } from '../../services/genre';
import { Event, Genre } from '../../types';

const EditEvent: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [availableGenres, setAvailableGenres] = useState<Genre[]>([]);
  const [event, setEvent] = useState<Event | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
    isVisible: boolean;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        const [fetchedEvent, genres] = await Promise.all([
          getEventById(id),
          getAllGenres()
        ]);
        setEvent(fetchedEvent);
        setAvailableGenres(genres);
      }
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (event && id) {
        await updateEvent(id, event);
        setNotification({
          type: 'success',
          message: 'Event updated successfully!',
          isVisible: true,
        });
        setTimeout(() => navigate('/dashboard'), 1500);
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to update event',
        isVisible: true,
      });
    }
  };

  const handleGenreChange = (genreId: string) => {
    if (!event) return;
    
    setEvent(prev => {
      if (!prev) return null;
      const genres = prev.genres.map(g => g._id);
      const newGenres = genres.includes(genreId)
        ? prev.genres.filter(g => g._id !== genreId)
        : [...prev.genres, availableGenres.find(g => g._id === genreId)!];

      return {
        ...prev,
        genres: newGenres,
      };
    });
  };

  if (!event) return <div>Loading...</div>;

  const Notification = () => {
    if (!notification?.isVisible) return null;
  
    const baseStyles = "fixed top-5 right-5 px-6 py-3 rounded-lg shadow-lg z-50";
    const typeStyles = notification.type === "success" 
      ? "bg-green-500 text-white" 
      : "bg-red-500 text-white";
  
    return (
      <div className={`${baseStyles} ${typeStyles}`}>
        {notification.message}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto py-8 space-y-4">
      <Notification />
      <h2 className="text-2xl font-semibold mb-6">Edit Event</h2>
      
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          type="text"
          value={event.title}
          onChange={(e) => setEvent({ ...event, title: e.target.value })}
          className="w-full px-3 py-2 border rounded"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={event.description}
          onChange={(e) => setEvent({ ...event, description: e.target.value })}
          className="w-full px-3 py-2 border rounded"
          rows={4}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Genres</label>
        <div className="space-y-2">
          {availableGenres.map(genre => (
            <label key={genre._id} className="flex items-center">
              <input
                type="checkbox"
                checked={event.genres.some(g => g._id === genre._id)}
                onChange={() => handleGenreChange(genre._id)}
                className="mr-2"
              />
              {genre.name}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Required Instruments</label>
        <input
          type="text"
          value={event.requiredInstruments.join(', ')}
          onChange={(e) => setEvent({ 
            ...event, 
            requiredInstruments: e.target.value.split(',').map(item => item.trim()) 
          })}
          className="w-full px-3 py-2 border rounded"
          placeholder="Enter instruments separated by commas"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Location</label>
        <input
          type="text"
          value={event.location}
          onChange={(e) => setEvent({ ...event, location: e.target.value })}
          className="w-full px-3 py-2 border rounded"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Event Date</label>
        <input
          type="datetime-local"
          value={new Date(event.eventDate).toISOString().slice(0, 16)}
          onChange={(e) => setEvent({ ...event, eventDate: new Date(e.target.value) })}
          className="w-full px-3 py-2 border rounded"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Duration (hours)</label>
        <input
          type="number"
          value={event.duration}
          onChange={(e) => setEvent({ ...event, duration: Number(e.target.value) })}
          className="w-full px-3 py-2 border rounded"
          min="0"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Payment Amount</label>
          <input
            type="number"
            value={event.paymentAmount}
            onChange={(e) => setEvent({ ...event, paymentAmount: Number(e.target.value) })}
            className="w-full px-3 py-2 border rounded"
            min="0"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Payment Type</label>
          <select
            value={event.paymentType}
            onChange={(e) => setEvent({ ...event, paymentType: e.target.value as 'fixed' | 'hourly' })}
            className="w-full px-3 py-2 border rounded"
            required
          >
            <option value="fixed">Fixed</option>
            <option value="hourly">Hourly</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Required Experience (years)</label>
        <input
          type="number"
          value={event.requiredExperience}
          onChange={(e) => setEvent({ ...event, requiredExperience: Number(e.target.value) })}
          className="w-full px-3 py-2 border rounded"
          min="0"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Application Deadline</label>
        <input
          type="datetime-local"
          value={new Date(event.applicationDeadline).toISOString().slice(0, 16)}
          onChange={(e) => setEvent({ ...event, applicationDeadline: new Date(e.target.value) })}
          className="w-full px-3 py-2 border rounded"
          required
        />
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 border rounded hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
};

export default EditEvent;
