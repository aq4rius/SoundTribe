// EventForm — unified create/edit form for events
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import ErrorAlert from '../common/error-alert';
import { getGenres } from '@/actions/genres';
import { createEventAction, updateEventAction, getEventByIdAction } from '@/actions/events';

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

function SuccessModal({ show, message, onClose }: { show: boolean; message: string; onClose: () => void }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-lg p-8 max-w-sm w-full text-center border border-fuchsia-400">
        <h2 className="text-2xl font-bold mb-2 text-fuchsia-700 dark:text-fuchsia-300">Success!</h2>
        <p className="mb-4 text-zinc-700 dark:text-zinc-200">{message}</p>
        <button className="btn btn-primary" onClick={onClose}>OK</button>
      </div>
    </div>
  );
}

interface EventFormProps {
  mode: 'create' | 'edit';
  eventId?: string;
  onSuccess?: () => void;
}

export default function EventForm({ mode, eventId, onSuccess }: EventFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [serverFieldErrors, setServerFieldErrors] = useState<Record<string, string[]>>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [genres, setGenres] = useState<{ id: string; name: string }[]>([]);
  const [genresLoading, setGenresLoading] = useState(true);
  const [loading, setLoading] = useState(mode === 'edit');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '',
      description: '',
      genres: [],
      requiredInstruments: '',
      location: '',
      eventDate: '',
      duration: 0,
      paymentAmount: 0,
      paymentType: 'fixed',
      requiredExperience: 0,
      applicationDeadline: '',
    },
  });

  useEffect(() => {
    getGenres()
      .then(setGenres)
      .catch(() => setGenres([]))
      .finally(() => setGenresLoading(false));
  }, []);

  useEffect(() => {
    if (mode !== 'edit' || !eventId) return;
    setLoading(true);
    getEventByIdAction(eventId)
      .then((result) => {
        if (result.success && result.data) {
          const event = result.data;
          setValue('title', event.title || '');
          setValue('description', event.description || '');
          setValue('genres', event.genres?.map((g: { id: string }) => g.id) || []);
          setValue('requiredInstruments', event.requiredInstruments?.join(', ') || '');
          setValue('location', event.location || '');
          setValue(
            'eventDate',
            event.eventDate ? new Date(event.eventDate).toISOString().slice(0, 16) : '',
          );
          setValue('duration', event.duration || 0);
          setValue('paymentAmount', Number(event.paymentAmount) || 0);
          setValue('paymentType', event.paymentType || 'fixed');
          setValue('requiredExperience', event.requiredExperience || 0);
          setValue(
            'applicationDeadline',
            event.applicationDeadline
              ? new Date(event.applicationDeadline).toISOString().slice(0, 16)
              : '',
          );
        } else {
          setError('Failed to load event');
        }
      })
      .catch(() => setError('Failed to load event'))
      .finally(() => setLoading(false));
  }, [mode, eventId, setValue]);

  const onSubmit = async (data: EventFormValues) => {
    setError(null);
    setServerFieldErrors({});
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.set('title', data.title);
      formData.set('description', data.description);
      data.genres.forEach((g) => formData.append('genres', g));
      formData.set('requiredInstruments', data.requiredInstruments);
      formData.set('location', data.location);
      formData.set('eventDate', data.eventDate);
      formData.set('duration', String(data.duration));
      formData.set('paymentAmount', String(data.paymentAmount));
      formData.set('paymentType', data.paymentType);
      formData.set('requiredExperience', String(data.requiredExperience));
      formData.set('applicationDeadline', data.applicationDeadline);

      const result =
        mode === 'edit' && eventId
          ? await updateEventAction(eventId, formData)
          : await createEventAction(formData);

      if (!result.success) {
        setError(result.error);
        if (result.fieldErrors) setServerFieldErrors(result.fieldErrors);
        return;
      }

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        if (onSuccess) onSuccess();
        else window.location.href = '/dashboard';
      }, 1400);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="text-white/60">Loading...</div>;

  /** Show client-side OR server-side field error. */
  const fieldError = (name: string) => {
    const clientErr = errors[name as keyof EventFormValues]?.message;
    const serverErr = serverFieldErrors[name];
    if (clientErr) return <span className="text-red-400 text-xs">{clientErr}</span>;
    if (serverErr) return <span className="text-red-400 text-xs">{serverErr.join(', ')}</span>;
    return null;
  };

  const inputCls = "w-full px-3 py-2 border border-white/20 rounded bg-white/10 text-white placeholder-white/40 focus:ring-2 focus:ring-cyan-400 focus:outline-none transition";
  const labelCls = "block text-sm font-medium mb-1 text-white/80";

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <h2 className="text-2xl font-semibold mb-6 text-white">
          {mode === 'edit' ? 'Edit Event' : 'Create New Event'}
        </h2>
        {error && <ErrorAlert message={error} onClose={() => setError(null)} />}
        <div>
          <label className={labelCls}>Title</label>
          <input type="text" {...register('title')} className={inputCls} />
          {fieldError('title')}
        </div>
        <div>
          <label className={labelCls}>Description</label>
          <textarea {...register('description')} className={inputCls} rows={4} />
          {fieldError('description')}
        </div>
        <div>
          <label className={labelCls}>Genres</label>
          {genresLoading ? (
            <div className="text-white/40">Loading genres...</div>
          ) : (
            <div className="space-y-2">
              {genres.map((genre) => (
                <label key={genre.id} className="flex items-center text-white/80">
                  <input
                    type="checkbox"
                    value={genre.id}
                    checked={watch('genres').includes(genre.id)}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      const prev = watch('genres');
                      setValue('genres', checked ? [...prev, genre.id] : prev.filter((id) => id !== genre.id));
                    }}
                    className="mr-2 accent-fuchsia-500"
                  />
                  {genre.name}
                </label>
              ))}
            </div>
          )}
          {fieldError('genres')}
        </div>
        <div>
          <label className={labelCls}>Required Instruments</label>
          <input type="text" {...register('requiredInstruments')} className={inputCls} placeholder="Enter instruments separated by commas" />
          {fieldError('requiredInstruments')}
        </div>
        <div>
          <label className={labelCls}>Location</label>
          <input type="text" {...register('location')} className={inputCls} />
          {fieldError('location')}
        </div>
        <div>
          <label className={labelCls}>Event Date</label>
          <input type="datetime-local" {...register('eventDate')} className={inputCls} />
          {fieldError('eventDate')}
        </div>
        <div>
          <label className={labelCls}>Duration (hours)</label>
          <input type="number" {...register('duration', { valueAsNumber: true })} className={inputCls} min="0" />
          {fieldError('duration')}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Payment Amount</label>
            <input type="number" {...register('paymentAmount', { valueAsNumber: true })} className={inputCls} min="0" />
            {fieldError('paymentAmount')}
          </div>
          <div>
            <label className={labelCls}>Payment Type</label>
            <select {...register('paymentType')} className={inputCls}>
              <option value="fixed">Fixed</option>
              <option value="hourly">Hourly</option>
            </select>
            {fieldError('paymentType')}
          </div>
        </div>
        <div>
          <label className={labelCls}>Required Experience (years)</label>
          <input type="number" {...register('requiredExperience', { valueAsNumber: true })} className={inputCls} min="0" />
          {fieldError('requiredExperience')}
        </div>
        <div>
          <label className={labelCls}>Application Deadline</label>
          <input type="datetime-local" {...register('applicationDeadline')} className={inputCls} />
          {fieldError('applicationDeadline')}
        </div>
        <div className="flex justify-end space-x-4">
          <button type="button" className="px-4 py-2 text-white/60 hover:text-white transition" onClick={() => (window.location.href = '/dashboard')}>Cancel</button>
          <button type="submit" className="px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded transition" disabled={isSubmitting}>
            {isSubmitting ? (mode === 'edit' ? 'Updating...' : 'Creating...') : mode === 'edit' ? 'Update Event' : 'Create Event'}
          </button>
        </div>
      </form>
      <SuccessModal
        show={showSuccess}
        message={mode === 'edit' ? 'Your event was updated successfully.' : 'Your event was created successfully.'}
        onClose={() => {
          setShowSuccess(false);
          window.location.href = '/dashboard';
        }}
      />
    </>
  );
}
