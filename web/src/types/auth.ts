/**
 * User & auth types.
 *
 * CANONICAL types are Prisma-derived (e.g., PrismaAuthUser, PrismaUserFull).
 * TRANSITIONAL types (I-prefixed) are used by components still talking
 * to the Express API and will be removed when the Express layer is retired.
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

// ─── Transitional Types (Express API shape) ────────────────────────────────────

/**
 * @deprecated TRANSITIONAL — used by components still calling the Express API.
 * Will be replaced by PrismaUserFull when API routes move to Next.js.
 */
export interface IUser {
  _id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  location?: string;
  bio?: string;
  roles: string[];
  onboardingStep: number;
  onboardingComplete: boolean;
  preferences: UserPreferences;
  locationDetails?: LocationDetails;
  notificationPreferences?: NotificationPreferences;
  privacySettings?: PrivacySettings;
  emailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * @deprecated TRANSITIONAL — Express API auth user (id instead of _id).
 */
export interface AuthUser extends Omit<IUser, '_id'> {
  id: string;
}

/** Shape returned by POST /api/auth/login (Express). */
export interface LoginResponse {
  token: string;
  user: AuthUser;
}

/** Shape returned by POST /api/auth/register (Express). */
export interface RegisterResponse {
  message: string;
  user: AuthUser;
  token: string;
}
