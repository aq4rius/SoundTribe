/**
 * Application types — mirrors server/src/models/Application.ts
 *
 * An Application is submitted by an artist to an event posting.
 *
 * Relations (applicant, artistProfile, eventPosting) can be either:
 *   - a string (unpopulated MongoDB ObjectId)
 *   - a populated object with key fields
 *
 * Use the type guards below to safely narrow these unions.
 */

import type { IArtistProfile } from './artist';
import type { IEventPosting } from './event';

export type ApplicationStatus = 'pending' | 'accepted' | 'rejected';

/** Populated user shape — only the fields returned by Mongoose .populate() */
export interface PopulatedUser {
  _id: string;
  username: string;
  email?: string;
}

/** Populated artist profile shape (subset) */
export interface PopulatedArtistProfile {
  _id: string;
  stageName: string;
}

/** Populated event posting shape (subset) */
export interface PopulatedEventPosting {
  _id: string;
  title: string;
}

/**
 * The canonical Application interface.
 * Relations are unions of string | populated object.
 */
export interface IApplication {
  _id: string;
  applicant: string | PopulatedUser;
  artistProfile: string | PopulatedArtistProfile;
  eventPosting: string | PopulatedEventPosting;
  coverLetter: string;
  status: ApplicationStatus;
  proposedRate?: number;
  availability: string[];
  createdAt: string;
  updatedAt: string;
}

// ─── Type Guards ───────────────────────────────────────────────────────────────

export function isPopulatedArtistProfile(
  value: string | PopulatedArtistProfile,
): value is PopulatedArtistProfile {
  return typeof value === 'object' && value !== null && 'stageName' in value;
}

export function isPopulatedEventPosting(
  value: string | PopulatedEventPosting,
): value is PopulatedEventPosting {
  return typeof value === 'object' && value !== null && 'title' in value;
}

export function isPopulatedUser(
  value: string | PopulatedUser,
): value is PopulatedUser {
  return typeof value === 'object' && value !== null && '_id' in value;
}
