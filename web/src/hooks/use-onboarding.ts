'use client';

import { useState, useEffect } from 'react';
import { getOnboardingState, updateOnboardingState } from '../services/user';
import { useSession } from 'next-auth/react';

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

export function useOnboarding() {
  // TRANSITIONAL: token is undefined until Phase 3 migrates Express API calls
  const { data: session } = useSession();
  const token: string | undefined = undefined;
  const [onboarding, setOnboarding] = useState<OnboardingState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    getOnboardingState(token)
      .then((data: OnboardingState) => {
        setOnboarding(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load onboarding state');
        setLoading(false);
      });
  }, [token]);

  const saveOnboarding = async (data: Partial<OnboardingState>) => {
    if (!token) return;
    setLoading(true);
    try {
      await updateOnboardingState(token, data);
      setOnboarding((prev) => (prev ? { ...prev, ...data } : null));
      setLoading(false);
    } catch {
      setError('Failed to save onboarding');
      setLoading(false);
    }
  };

  return { onboarding, loading, error, saveOnboarding };
}
