/**
 * User & auth types — mirrors server/src/models/User.ts
 */

export type UserRole =
  | 'user'
  | 'artist'
  | 'organizer'
  | 'enthusiast'
  | 'collaborator'
  | 'networker'
  | 'admin';

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

/**
 * The user object stored client-side after login.
 *
 * Excludes sensitive fields (password, tokens) that are never sent to the
 * client by the Express API.
 */
export interface IUser {
  _id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  location?: string;
  bio?: string;
  roles: UserRole[];
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

/** Alias used by legacy `useAuth` hook (id instead of _id). */
export interface AuthUser extends Omit<IUser, '_id'> {
  id: string;
}

/** Shape returned by POST /api/auth/login. */
export interface LoginResponse {
  token: string;
  user: AuthUser;
}

/** Shape returned by POST /api/auth/register. */
export interface RegisterResponse {
  message: string;
  user: AuthUser;
  token: string;
}
