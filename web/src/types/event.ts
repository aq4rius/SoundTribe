/**
 * EventPosting types.
 *
 * Prisma-derived (PrismaEventPosting, PrismaEventPostingCard).
 */

import type { Prisma } from '@prisma/client';

// Re-export Prisma enums
export type { EventStatus, PaymentType } from '@prisma/client';

// ─── Prisma-Derived Types ──────────────────────────────────────────────────────

/** Full event for detail page. */
export type PrismaEventPosting = Prisma.EventPostingGetPayload<{
  include: {
    genres: true;
    organizer: { select: { id: true; username: true; profileImage: true } };
    lineup: { include: { genres: true } };
    applications: { select: { id: true } };
  };
}>;

/** Lightweight for event cards in browse list. */
export type PrismaEventPostingCard = Prisma.EventPostingGetPayload<{
  select: {
    id: true;
    title: true;
    location: true;
    eventDate: true;
    paymentAmount: true;
    paymentType: true;
    status: true;
    genres: { select: { id: true; name: true } };
    organizer: { select: { username: true; profileImage: true } };
  };
}>;

// ─── Filter Types ──────────────────────────────────────────────────────────────

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
