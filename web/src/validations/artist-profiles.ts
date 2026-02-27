import { z } from 'zod';

export const createArtistProfileSchema = z.object({
  stageName: z
    .string()
    .min(2, 'Stage name must be at least 2 characters')
    .max(50, 'Stage name must be at most 50 characters'),
  biography: z.string().min(20, 'Biography must be at least 20 characters').optional().or(z.literal('')),
  genres: z.array(z.string()).min(1, 'Select at least one genre'),
  instruments: z.array(z.string()).min(1, 'Select at least one instrument'),
  location: z.string().min(1, 'Location is required'),
  yearsOfExperience: z.coerce.number().int().min(0).max(50),
  ratePerHour: z.coerce.number().min(0).optional().nullable(),
  websiteUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  spotifyTrackUrl: z
    .string()
    .url('Must be a valid URL')
    .startsWith('https://open.spotify.com/', 'Must be a Spotify URL (https://open.spotify.com/...)')
    .optional()
    .or(z.literal('')),
  socialMediaLinks: z
    .object({
      facebook: z.string().optional().or(z.literal('')),
      instagram: z.string().optional().or(z.literal('')),
      twitter: z.string().optional().or(z.literal('')),
      youtube: z.string().optional().or(z.literal('')),
      tiktok: z.string().optional().or(z.literal('')),
      other: z.string().optional().or(z.literal('')),
    })
    .optional(),
});

export const updateArtistProfileSchema = createArtistProfileSchema.partial();

export type CreateArtistProfileInput = z.infer<typeof createArtistProfileSchema>;
export type UpdateArtistProfileInput = z.infer<typeof updateArtistProfileSchema>;
