export interface OnboardingPreferences {
  genres?: string[];
  instruments?: string[];
  influences?: string[];
  eventTypes?: string[];
}

export interface OnboardingLocationDetails {
  city?: string;
  region?: string;
  willingToTravel?: number;
}

export interface OnboardingNotificationPreferences {
  email?: boolean;
  push?: boolean;
}

export interface OnboardingState {
  onboardingStep: number;
  onboardingComplete: boolean;
  bio?: string;
  roles?: string[];
  preferences?: OnboardingPreferences;
  locationDetails?: OnboardingLocationDetails;
  notificationPreferences?: OnboardingNotificationPreferences;
}
