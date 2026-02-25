/**
 * Centralized type re-exports.
 *
 * Import from '@/types' for convenience:
 * ```ts
 * import type { PrismaAuthUser, PrismaEventPosting, PrismaMessage } from '@/types';
 * ```
 */

// API response wrappers
export type { ApiResponse, PaginatedResponse, ApiError } from './api';

// ─── Prisma-Derived Types ──────────────────────────────────────────────────────

export type { PrismaAuthUser, PrismaUserFull } from './auth';
export type { PrismaEventPosting, PrismaEventPostingCard } from './event';
export type { PrismaArtistProfile, PrismaArtistProfileCard } from './artist';
export type { PrismaApplication, PrismaApplicationCard } from './application';
export type { PrismaMessage, PrismaConversation } from './message';
export type { PrismaNotification } from './notification';
export type { Genre } from './genre';

// ─── Prisma Enums ──────────────────────────────────────────────────────────────

export type { UserRole } from './auth';
export type { EventStatus, PaymentType } from './event';
export type { ApplicationStatus } from './application';
export type { MessageStatus, EntityType } from './message';
export type { NotificationType } from './notification';

// ─── JSON sub-document shapes ──────────────────────────────────────────────────

export type {
  UserPreferences,
  LocationDetails,
  NotificationPreferences,
  PrivacySettings,
} from './auth';

export type { SocialMediaLinks, PortfolioItem, Availability } from './artist';
export type { MessageReaction } from './message';

// ─── Filter Types ──────────────────────────────────────────────────────────────

export type { EventFilters } from './event';
export type { ArtistFilters } from './artist';

// ─── Onboarding ────────────────────────────────────────────────────────────────

export type {
  OnboardingState,
  OnboardingPreferences,
  OnboardingLocationDetails,
  OnboardingNotificationPreferences,
} from './onboarding';

// ─── Action Result Type ────────────────────────────────────────────────────────

export type { ActionResult } from './actions';
