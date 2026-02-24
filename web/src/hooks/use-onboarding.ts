"use client";

import { useState, useEffect } from 'react';
import { getOnboardingState, updateOnboardingState } from '../services/user';
import { useAuth } from './use-auth';

export interface OnboardingState {
  onboardingStep: number;
  onboardingComplete: boolean;
  preferences?: Record<string, unknown>;
  locationDetails?: Record<string, unknown>;
  notificationPreferences?: Record<string, unknown>;
}

export function useOnboarding() {
  const { token } = useAuth();
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
