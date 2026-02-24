/**
 * Centralized type re-exports.
 *
 * Import from '@/types' for convenience:
 * ```ts
 * import type { IUser, IEventPosting, IMessage } from '@/types';
 * ```
 */

// API response wrappers
export type { ApiResponse, PaginatedResponse, ApiError } from './api';

// Domain models
export type {
  IUser,
  AuthUser,
  UserRole,
  UserPreferences,
  LocationDetails,
  NotificationPreferences,
  PrivacySettings,
  LoginResponse,
  RegisterResponse,
} from './auth';

export type {
  IEventPosting,
  EventStatus,
  PaymentType,
  EventFilters,
} from './event';

export type {
  IArtistProfile,
  SocialMediaLinks,
  PortfolioItem,
  Availability,
  ArtistFilters,
} from './artist';

export type {
  IApplication,
  ApplicationStatus,
  PopulatedUser,
  PopulatedArtistProfile,
  PopulatedEventPosting,
} from './application';

export {
  isPopulatedArtistProfile,
  isPopulatedEventPosting,
  isPopulatedUser,
} from './application';

export type {
  IMessage,
  IConversation,
  ChatEntity,
  EntityType,
  MessageEntity,
  MessageReaction,
  MessageStatus,
} from './message';

export type {
  INotification,
  NotificationRelatedEntity,
} from './notification';

export type { IGenre } from './genre';
