/**
 * EventPosting types — mirrors server/src/models/Event.ts
 *
 * Events in SoundTribe are **job postings** (not calendar events).
 * An organizer posts an event with required instruments, pay, and deadline.
 * Artists apply to these postings.
 */

import type { IGenre } from './genre';

export type EventStatus = 'open' | 'closed' | 'filled';
export type PaymentType = 'fixed' | 'hourly';

export interface IEventPosting {
  _id: string;
  postedBy: string | { _id: string; username: string; email?: string };
  /** Optional image URL for the event. */
  image?: string;
  title: string;
  description: string;
  genres: (string | IGenre)[];
  requiredInstruments: string[];
  location: string;
  eventDate: string;
  /** Duration in hours. */
  duration: number;
  paymentAmount: number;
  paymentType: PaymentType;
  /** Required years of experience. */
  requiredExperience: number;
  applicationDeadline: string;
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
}

/** Filters accepted by the search endpoint. */
export interface EventFilters {
  search?: string;
  searchTerm?: string;
  genres?: string[];
  selectedGenres?: string[] | string;
  location?: string;
  instruments?: string;
  dateFrom?: string;
  dateTo?: string;
  paymentMin?: string;
  paymentMax?: string;
  paymentType?: string;
  status?: string;
  page?: number;
  limit?: number;
}
