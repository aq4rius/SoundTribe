import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllGenres } from '../../services/genre';
import { createEvent } from '../../services/event';

const CreateEvent: React.FC = () => {
  const navigate = useNavigate();
  const [availableGenres, setAvailableGenres] = useState<{ _id: string; name: string }[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [eventInfo, setEventInfo] = useState({
    title: '',
    description: '',
    requiredInstruments: [] as string[],
    location: '',
    eventDate: '',
    duration: 0,
    paymentAmount: 0,
    paymentType: 'fixed' as 'fixed' | 'hourly',
    requiredExperience: 0,
    applicationDeadline: '',
    status: 'open' as 'open' | 'closed' | 'filled'
  });

  useEffect(() => {
    const fetchGenres = async () => {
      const genres = await getAllGenres();
      setAvailableGenres(genres);
    };
    fetchGenres();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createEvent({
        ...eventInfo,
        genres: selectedGenres,
        eventDate: new Date(eventInfo.eventDate),
        applicationDeadline: new Date(eventInfo.applicationDeadline)
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating event posting:', error);
    }
  };

  const handleGenreChange = (genreId: string) => {
    setSelectedGenres(prev => 
      prev.includes(genreId) 
        ? prev.filter(id => id !== genreId)
        : [...prev, genreId]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto py-8 space-y-4">
      <h2 className="text-2xl font-semibold mb-6">Create New Event</h2>
      
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          type="text"
          value={eventInfo.title}
          onChange={(e) => setEventInfo({ ...eventInfo, title: e.target.value })}
          className="w-full px-3 py-2 border rounded"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          value={eventInfo.description}
          onChange={(e) => setEventInfo({ ...eventInfo, description: e.target.value })}
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
                checked={selectedGenres.includes(genre._id)}
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
          value={eventInfo.requiredInstruments.join(', ')}
          onChange={(e) => setEventInfo({ 
            ...eventInfo, 
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
          value={eventInfo.location}
          onChange={(e) => setEventInfo({ ...eventInfo, location: e.target.value })}
          className="w-full px-3 py-2 border rounded"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Event Date</label>
        <input
          type="datetime-local"
          value={eventInfo.eventDate}
          onChange={(e) => setEventInfo({ ...eventInfo, eventDate: e.target.value })}
          className="w-full px-3 py-2 border rounded"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Duration (hours)</label>
        <input
          type="number"
          value={eventInfo.duration}
          onChange={(e) => setEventInfo({ ...eventInfo, duration: Number(e.target.value) })}
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
            value={eventInfo.paymentAmount}
            onChange={(e) => setEventInfo({ ...eventInfo, paymentAmount: Number(e.target.value) })}
            className="w-full px-3 py-2 border rounded"
            min="0"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Payment Type</label>
          <select
            value={eventInfo.paymentType}
            onChange={(e) => setEventInfo({ ...eventInfo, paymentType: e.target.value as 'fixed' | 'hourly' })}
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
          value={eventInfo.requiredExperience}
          onChange={(e) => setEventInfo({ ...eventInfo, requiredExperience: Number(e.target.value) })}
          className="w-full px-3 py-2 border rounded"
          min="0"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Application Deadline</label>
        <input
          type="datetime-local"
          value={eventInfo.applicationDeadline}
          onChange={(e) => setEventInfo({ ...eventInfo, applicationDeadline: e.target.value })}
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
          Create Event
        </button>
      </div>
    </form>
  );
};

export default CreateEvent;
