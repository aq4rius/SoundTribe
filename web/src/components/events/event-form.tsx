// EventForm — unified create/edit form for events
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import ErrorAlert from '../common/error-alert';
import { getGenres } from '@/actions/genres';
import { createEventAction, updateEventAction, getEventByIdAction } from '@/actions/events';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

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
      <Card className="max-w-sm w-full text-center">
        <CardContent className="pt-6 space-y-4">
          <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto" />
          <h2 className="text-2xl font-bold">Success!</h2>
          <p className="text-muted-foreground">{message}</p>
          <Button onClick={onClose}>OK</Button>
        </CardContent>
      </Card>
    </div>
  );
}

interface EventFormProps {
  mode: 'create' | 'edit';
  eventId?: string;
  onSuccess?: () => void;
}

export default function EventForm({ mode, eventId, onSuccess }: EventFormProps) {
  const router = useRouter();
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
        else router.push('/dashboard');
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

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <h2 className="text-2xl font-semibold mb-6">
          {mode === 'edit' ? 'Edit Event' : 'Create New Event'}
        </h2>
        {error && <ErrorAlert message={error} onClose={() => setError(null)} />}
        <div className="space-y-2">
          <Label>Title</Label>
          <Input type="text" {...register('title')} />
          {fieldError('title')}
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea {...register('description')} rows={4} />
          {fieldError('description')}
        </div>
        <div className="space-y-2">
          <Label>Genres</Label>
          {genresLoading ? (
            <div className="text-muted-foreground text-sm">Loading genres...</div>
          ) : (
            <div className="space-y-2">
              {genres.map((genre) => (
                <label key={genre.id} className="flex items-center text-sm gap-2">
                  <input
                    type="checkbox"
                    value={genre.id}
                    checked={watch('genres').includes(genre.id)}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      const prev = watch('genres');
                      setValue('genres', checked ? [...prev, genre.id] : prev.filter((id) => id !== genre.id));
                    }}
                    className="accent-primary h-4 w-4"
                  />
                  {genre.name}
                </label>
              ))}
            </div>
          )}
          {fieldError('genres')}
        </div>
        <div className="space-y-2">
          <Label>Required Instruments</Label>
          <Input type="text" {...register('requiredInstruments')} placeholder="Enter instruments separated by commas" />
          {fieldError('requiredInstruments')}
        </div>
        <div className="space-y-2">
          <Label>Location</Label>
          <Input type="text" {...register('location')} />
          {fieldError('location')}
        </div>
        <div className="space-y-2">
          <Label>Event Date</Label>
          <Input type="datetime-local" {...register('eventDate')} />
          {fieldError('eventDate')}
        </div>
        <div className="space-y-2">
          <Label>Duration (hours)</Label>
          <Input type="number" {...register('duration', { valueAsNumber: true })} min="0" />
          {fieldError('duration')}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Payment Amount</Label>
            <Input type="number" {...register('paymentAmount', { valueAsNumber: true })} min="0" />
            {fieldError('paymentAmount')}
          </div>
          <div className="space-y-2">
            <Label>Payment Type</Label>
            <select {...register('paymentType')} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
              <option value="fixed">Fixed</option>
              <option value="hourly">Hourly</option>
            </select>
            {fieldError('paymentType')}
          </div>
        </div>
        <div className="space-y-2">
          <Label>Required Experience (years)</Label>
          <Input type="number" {...register('requiredExperience', { valueAsNumber: true })} min="0" />
          {fieldError('requiredExperience')}
        </div>
        <div className="space-y-2">
          <Label>Application Deadline</Label>
          <Input type="datetime-local" {...register('applicationDeadline')} />
          {fieldError('applicationDeadline')}
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={() => router.push('/dashboard')}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (mode === 'edit' ? 'Updating...' : 'Creating...') : mode === 'edit' ? 'Update Event' : 'Create Event'}
          </Button>
        </div>
      </form>
      <SuccessModal
        show={showSuccess}
        message={mode === 'edit' ? 'Your event was updated successfully.' : 'Your event was created successfully.'}
        onClose={() => {
          setShowSuccess(false);
          router.push('/dashboard');
        }}
      />
    </>
  );
}
