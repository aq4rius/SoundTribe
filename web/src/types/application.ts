/**
 * Application types.
 *
 * CANONICAL: Prisma-derived (PrismaApplication, PrismaApplicationCard).
 * TRANSITIONAL: IApplication (Express API shape with _id and populated unions).
 */

import type { Prisma } from '@prisma/client';

// Re-export Prisma enum
export type { ApplicationStatus } from '@prisma/client';

// ─── Prisma-Derived Types ──────────────────────────────────────────────────────

/** Full application for detail view. */
export type PrismaApplication = Prisma.ApplicationGetPayload<{
  include: {
    applicant: { select: { id: true; username: true; profileImage: true } };
    artistProfile: { select: { id: true; stageName: true; profileImage: true } };
    eventPosting: { select: { id: true; title: true; location: true; eventDate: true } };
  };
}>;

/** Lightweight for application list cards. */
export type PrismaApplicationCard = Prisma.ApplicationGetPayload<{
  select: {
    id: true;
    status: true;
    createdAt: true;
    artistProfile: { select: { id: true; stageName: true } };
    eventPosting: { select: { id: true; title: true } };
  };
}>;

// ─── Transitional Types (Express API shape) ────────────────────────────────────

/** Populated user shape from Mongoose .populate() */
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
 * @deprecated TRANSITIONAL — used by components still calling the Express API.
 * Relations are unions of string | populated object.
 */
export interface IApplication {
  _id: string;
  applicant: string | PopulatedUser;
  artistProfile: string | PopulatedArtistProfile;
  eventPosting: string | PopulatedEventPosting;
  coverLetter: string;
  status: string;
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

export function isPopulatedUser(value: string | PopulatedUser): value is PopulatedUser {
  return typeof value === 'object' && value !== null && '_id' in value;
}
