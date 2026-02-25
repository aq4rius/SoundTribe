/**
 * User & auth types.
 *
 * Prisma-derived (PrismaAuthUser, PrismaUserFull).
 */

import type { Prisma } from '@prisma/client';

// Re-export Prisma enum for convenience
export type { UserRole } from '@prisma/client';

// ─── Prisma-Derived Types ──────────────────────────────────────────────────────

/** Safe user payload for client-side auth — password is NEVER included. */
export type PrismaAuthUser = Prisma.UserGetPayload<{
  select: {
    id: true;
    username: true;
    email: true;
    roles: true;
    onboardingComplete: true;
    onboardingStep: true;
    profileImage: true;
  };
}>;

/** Full user for profile / settings pages (still excludes password). */
export type PrismaUserFull = Prisma.UserGetPayload<{
  select: {
    id: true;
    username: true;
    email: true;
    firstName: true;
    lastName: true;
    location: true;
    bio: true;
    roles: true;
    onboardingStep: true;
    onboardingComplete: true;
    profileImage: true;
    preferences: true;
    locationDetails: true;
    notificationPreferences: true;
    privacySettings: true;
    emailVerified: true;
    createdAt: true;
    updatedAt: true;
  };
}>;

// ─── JSON sub-document shapes (typed overlays for Json? columns) ───────────────

export interface UserPreferences {
  genres?: string[];
  instruments?: string[];
  influences?: string[];
  eventTypes?: string[];
  skills?: string[];
}

export interface LocationDetails {
  city?: string;
  region?: string;
  /** Willing to travel distance in km. */
  willingToTravel?: number;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
}

export interface PrivacySettings {
  showEmail: boolean;
  showLocation: boolean;
}
