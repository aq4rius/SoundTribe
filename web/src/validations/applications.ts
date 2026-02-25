import { z } from 'zod';

export const createApplicationSchema = z.object({
  eventPostingId: z.string().uuid('Invalid event ID'),
  coverLetter: z
    .string()
    .min(10, 'Cover letter must be at least 10 characters')
    .max(1000, 'Cover letter must be at most 1000 characters'),
  proposedRate: z.coerce.number().min(0, 'Proposed rate must be non-negative').optional(),
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
