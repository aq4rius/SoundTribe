/**
 * ArtistProfile types — mirrors server/src/models/ArtistProfile.ts
 */

import type { IGenre } from './genre';

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
