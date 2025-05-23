// EditEventForm.tsx
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import ErrorAlert from '../common/ErrorAlert';
import { useAuth } from '@/hooks/useAuth';

const eventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  genres: z.array(z.string()).min(1, 'At least one genre must be selected'),
  requiredInstruments: z.string().min(1, 'Required instruments are required'),
  location: z.string().min(1, 'Location is required'),
  eventDate: z.string().min(1, 'Event date is required'),
  duration: z.coerce.number().min(0, 'Duration is required'),
  paymentAmount: z.coerce.number().min(0, 'Payment amount is required'),
  paymentType: z.enum(['fixed', 'hourly']),
  requiredExperience: z.coerce.number().min(0),
  applicationDeadline: z.string().min(1, 'Application deadline is required'),
});

type EventFormValues = z.infer<typeof eventSchema>;

async function fetchGenres() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/genres`);
  if (!res.ok) throw new Error('Failed to fetch genres');
  return await res.json();
}

function SuccessModal({ show, onClose }: { show: boolean; onClose: () => void }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-8 max-w-sm w-full text-center border border-fuchsia-400">
        <h2 className="text-2xl font-bold mb-2 text-fuchsia-700 dark:text-fuchsia-300">Success!</h2>
        <p className="mb-4 text-zinc-700 dark:text-zinc-200">Your event was updated successfully.</p>
        <button className="btn btn-primary" onClick={onClose}>OK</button>
      </div>
    </div>
  );
}

export default function EditEventForm({ eventId, onSuccess }: { eventId: string, onSuccess?: () => void }) {
  const { token } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [genres, setGenres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
  });

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [genresRes, eventRes] = await Promise.all([
          fetchGenres(),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/event-postings/${eventId}`),
        ]);
        setGenres(genresRes);
        if (!eventRes.ok) throw new Error('Failed to fetch event');
        const event = await eventRes.json();
        setValue('title', event.title || '');
        setValue('description', event.description || '');
        setValue('genres', event.genres?.map((g: any) => g._id || g) || []);
        setValue('requiredInstruments', event.requiredInstruments?.join(', ') || '');
        setValue('location', event.location || '');
        setValue('eventDate', event.eventDate ? new Date(event.eventDate).toISOString().slice(0, 16) : '');
        setValue('duration', event.duration || 0);
        setValue('paymentAmount', event.paymentAmount || 0);
        setValue('paymentType', event.paymentType || 'fixed');
        setValue('requiredExperience', event.requiredExperience || 0);
        setValue('applicationDeadline', event.applicationDeadline ? new Date(event.applicationDeadline).toISOString().slice(0, 16) : '');
      } catch (err: any) {
        setError(err.message || 'Failed to load event or genres');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [eventId, setValue]);

  useEffect(() => {
    if (!token) {
      setError('You must be logged in to edit events.');
    }
  }, [token]);

  const onSubmit = async (data: EventFormValues) => {
    setError(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/event-postings/${eventId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            ...data,
            requiredInstruments: data.requiredInstruments.split(',').map((i: string) => i.trim()),
          }),
        }
      );
      if (!res.ok) throw new Error((await res.json()).message || 'Failed to update event');
      setSuccess(true);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        if (onSuccess) onSuccess();
        window.location.href = '/dashboard';
      }, 1400);
    } catch (err: any) {
      setError(err.message || 'Failed to update event');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <h2 className="text-2xl font-semibold mb-6">Edit Event</h2>
        {error && <ErrorAlert message={error} onClose={() => setError(null)} />}
        {success && <div className="alert alert-success">Event updated successfully!</div>}
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input type="text" {...register('title')} className="w-full px-3 py-2 border rounded" />
          {errors.title && <span className="text-red-500 text-xs">{errors.title.message}</span>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea {...register('description')} className="w-full px-3 py-2 border rounded" rows={4} />
          {errors.description && <span className="text-red-500 text-xs">{errors.description.message}</span>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Genres</label>
          <div className="space-y-2">
            {genres.map((genre: any) => (
              <label key={genre._id} className="flex items-center">
                <input
                  type="checkbox"
                  value={genre._id}
                  checked={watch('genres')?.includes(genre._id)}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    const value = genre._id;
                    const prev = watch('genres') || [];
                    setValue(
                      'genres',
                      checked ? [...prev, value] : prev.filter((id: string) => id !== value),
                    );
                  }}
                  className="mr-2"
                />
                {genre.name}
              </label>
            ))}
          </div>
          {errors.genres && <span className="text-red-500 text-xs">{errors.genres.message}</span>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Required Instruments</label>
          <input
            type="text"
            {...register('requiredInstruments')}
            className="w-full px-3 py-2 border rounded"
            placeholder="Enter instruments separated by commas"
          />
          {errors.requiredInstruments && <span className="text-red-500 text-xs">{errors.requiredInstruments.message}</span>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Location</label>
          <input type="text" {...register('location')} className="w-full px-3 py-2 border rounded" />
          {errors.location && <span className="text-red-500 text-xs">{errors.location.message}</span>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Event Date</label>
          <input type="datetime-local" {...register('eventDate')} className="w-full px-3 py-2 border rounded" />
          {errors.eventDate && <span className="text-red-500 text-xs">{errors.eventDate.message}</span>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Duration (hours)</label>
          <input type="number" {...register('duration', { valueAsNumber: true })} className="w-full px-3 py-2 border rounded" min="0" />
          {errors.duration && <span className="text-red-500 text-xs">{errors.duration.message}</span>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Payment Amount</label>
            <input type="number" {...register('paymentAmount', { valueAsNumber: true })} className="w-full px-3 py-2 border rounded" min="0" />
            {errors.paymentAmount && <span className="text-red-500 text-xs">{errors.paymentAmount.message}</span>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Payment Type</label>
            <select {...register('paymentType')} className="w-full px-3 py-2 border rounded">
              <option value="fixed">Fixed</option>
              <option value="hourly">Hourly</option>
            </select>
            {errors.paymentType && <span className="text-red-500 text-xs">{errors.paymentType.message}</span>}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Required Experience (years)</label>
          <input type="number" {...register('requiredExperience', { valueAsNumber: true })} className="w-full px-3 py-2 border rounded" min="0" />
          {errors.requiredExperience && <span className="text-red-500 text-xs">{errors.requiredExperience.message}</span>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Application Deadline</label>
          <input type="datetime-local" {...register('applicationDeadline')} className="w-full px-3 py-2 border rounded" />
          {errors.applicationDeadline && <span className="text-red-500 text-xs">{errors.applicationDeadline.message}</span>}
        </div>
        <div className="flex justify-end space-x-4">
          <button type="button" className="btn btn-ghost" onClick={() => window.location.href = '/dashboard'}>
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Update Event
          </button>
        </div>
      </form>
      <SuccessModal show={showSuccess} onClose={() => {
        setShowSuccess(false);
        window.location.href = '/dashboard';
      }} />
    </>
  );
}
