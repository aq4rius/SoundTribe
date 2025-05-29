"use client";

import { useState, useEffect } from 'react';
import { getOnboardingState, updateOnboardingState } from '../services/user';
import { useAuth } from './useAuth';

export function useOnboarding() {
  const { token } = useAuth();
  const [onboarding, setOnboarding] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    getOnboardingState(token)
      .then((data) => {
        setOnboarding(data);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to load onboarding state');
        setLoading(false);
      });
  }, [token]);

  const saveOnboarding = async (data: any) => {
    if (!token) return;
    setLoading(true);
    try {
      await updateOnboardingState(token, data);
      setOnboarding((prev: any) => ({ ...prev, ...data }));
      setLoading(false);
    } catch (err) {
      setError('Failed to save onboarding');
      setLoading(false);
    }
  };

  return { onboarding, loading, error, saveOnboarding };
}
