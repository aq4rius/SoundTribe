/**
 * Application types.
 *
 * Prisma-derived (PrismaApplication, PrismaApplicationCard).
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
