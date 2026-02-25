/**
 * Centralized type re-exports.
 *
 * Import from '@/types' for convenience:
 * ```ts
 * import type { AuthUser, IEventPosting, PrismaMessage } from '@/types';
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

// ─── Socket Event Types ────────────────────────────────────────────────────────

export type {
  SocketNewMessage,
  SocketMessagesStatusUpdate,
  SocketMessageStatusChange,
  SocketMessageReaction,
  SocketTypingEvent,
  UnreadCount,
} from './message';

// ─── Transitional Types (Express API) ──────────────────────────────────────────

export type { IUser, AuthUser, LoginResponse, RegisterResponse } from './auth';

/** @deprecated Alias kept for any imports referencing LegacyAuthUser. */
export type { AuthUser as LegacyAuthUser } from './auth';

export type { IEventPosting, EventFilters } from './event';

export type { IArtistProfile, ArtistFilters } from './artist';

export type {
  IApplication,
  PopulatedUser,
  PopulatedArtistProfile,
  PopulatedEventPosting,
} from './application';

export { isPopulatedArtistProfile, isPopulatedEventPosting, isPopulatedUser } from './application';

export type { IMessage, IConversation, ChatEntity, MessageEntity } from './message';

export type { INotification, NotificationRelatedEntity } from './notification';

export type { IGenre } from './genre';
