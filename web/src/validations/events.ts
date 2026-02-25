import { z } from 'zod';

export const createEventSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must be at most 100 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  genres: z.array(z.string()).min(1, 'Select at least one genre'),
  requiredInstruments: z.array(z.string()).min(1, 'Specify at least one instrument'),
  location: z.string().min(1, 'Location is required'),
  eventDate: z.coerce.date().refine((d) => d > new Date(), 'Event date must be in the future'),
  duration: z.coerce.number().int().positive('Duration must be a positive integer'),
  paymentAmount: z.coerce.number().min(0, 'Payment must be non-negative'),
  paymentType: z.enum(['fixed', 'hourly']),
  requiredExperience: z.coerce.number().int().min(0).max(50).default(0),
  applicationDeadline: z.coerce.date(),
});

export const updateEventSchema = createEventSchema.partial();

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
