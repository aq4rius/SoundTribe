/**
 * ArtistProfile types.
 *
 * CANONICAL: Prisma-derived (PrismaArtistProfile, PrismaArtistProfileCard).
 * TRANSITIONAL: IArtistProfile (Express API shape with _id).
 */

import type { Prisma } from '@prisma/client';

// ─── Prisma-Derived Types ──────────────────────────────────────────────────────

/** Full artist profile for detail page. */
export type PrismaArtistProfile = Prisma.ArtistProfileGetPayload<{
  include: {
    genres: true;
    user: { select: { id: true; username: true; profileImage: true } };
  };
}>;

/** Lightweight for artist cards in browse list. */
export type PrismaArtistProfileCard = Prisma.ArtistProfileGetPayload<{
  select: {
    id: true;
    stageName: true;
    location: true;
    profileImage: true;
    instruments: true;
    ratePerHour: true;
    genres: { select: { id: true; name: true } };
  };
}>;

// ─── JSON sub-document shapes ──────────────────────────────────────────────────

export interface SocialMediaLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
  tiktok?: string;
  other?: string;
  /** Allow indexing by arbitrary platform name for dynamic access. */
  [key: string]: string | undefined;
}

export interface PortfolioItem {
  title: string;
  description?: string;
  mediaUrl: string;
  mediaType: 'audio' | 'video' | 'image';
}

export interface Availability {
  isAvailable: boolean;
  availableDates?: string[];
}

// ─── Transitional Types (Express API shape) ────────────────────────────────────

/** @deprecated TRANSITIONAL */
import type { IGenre } from './genre';

/**
 * @deprecated TRANSITIONAL — used by components still calling the Express API.
 */
export interface IArtistProfile {
  _id: string;
  user: string | { _id: string; username: string };
  stageName: string;
  biography?: string;
  genres: (string | IGenre)[];
  instruments: string[];
  yearsOfExperience: number;
  location: string;
  websiteUrl?: string;
  socialMediaLinks?: SocialMediaLinks;
  profileImage?: string;
  portfolioItems?: PortfolioItem[];
  availability: Availability;
  ratePerHour?: number;
  createdAt: string;
  updatedAt: string;
}

/** Filters accepted by the artist search endpoint. */
export interface ArtistFilters {
  search?: string;
  searchTerm?: string;
  genres?: string[];
  selectedGenres?: string;
  location?: string;
  instruments?: string;
  experienceMin?: string;
  rateMin?: string;
  rateMax?: string;
  page?: number;
  limit?: number;
}
