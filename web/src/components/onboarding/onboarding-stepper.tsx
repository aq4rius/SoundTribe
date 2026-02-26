'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import RoleStep from './steps/role-step';
import PreferencesStep from './steps/preferences-step';
import LocationStep from './steps/location-step';
import AvailabilityStep from './steps/availability-step';
import ProfileStep from './steps/profile-step';
import NotificationsStep from './steps/notifications-step';
import SummaryStep from './steps/summary-step';
import { getOnboardingStateAction, updateOnboardingAction } from '@/actions/users';
import type { OnboardingState } from '@/types/onboarding';

const steps = [
  { label: 'Role', component: RoleStep },
  { label: 'Preferences', component: PreferencesStep },
  { label: 'Location', component: LocationStep },
  { label: 'Availability', component: AvailabilityStep },
  { label: 'Profile', component: ProfileStep },
  { label: 'Notifications', component: NotificationsStep },
  { label: 'Summary', component: SummaryStep },
];

export default function OnboardingStepper() {
  const { update: updateSession } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const StepComponent = steps[step].component;
  const [onboarding, setOnboarding] = useState<OnboardingState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const result = await getOnboardingStateAction();
      if (result.success) {
        setOnboarding(result.data as unknown as OnboardingState);
      } else {
        setError(result.error);
      }
      setLoading(false);
    })();
  }, []);

  const saveOnboarding = useCallback(
    async (updates: Partial<OnboardingState>) => {
      const result = await updateOnboardingAction(updates as Record<string, unknown>);
      if (result.success) {
        setOnboarding((prev) => (prev ? { ...prev, ...updates } : null));
      } else {
        setError(result.error);
      }
    },
    [],
  );

  const goNext = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  if (loading) return <div className="text-center py-8 text-white/70">Loading onboarding...</div>;
  if (error) return <div className="text-center text-red-400 py-8">{error}</div>;

  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 min-h-[500px] rounded-xl shadow p-4 sm:p-8">
      <div className="flex items-center mb-6">
        {steps.map((s, i) => (
          <div
            key={s.label}
            className={`flex-1 text-center text-sm ${i === step ? 'font-bold text-cyan-400' : 'text-white/40'}`}
          >
            {s.label}
          </div>
        ))}
      </div>
      <div className="mb-4">
        <StepComponent
          goNext={goNext}
          goBack={goBack}
          onboarding={onboarding}
          saveOnboarding={saveOnboarding}
          onSessionUpdate={updateSession}
          router={router}
        />
      </div>
      <div className="flex justify-between">
        <button
          onClick={goBack}
          disabled={step === 0}
          className="px-4 py-2 rounded bg-white/10 text-white/80 hover:bg-white/20 disabled:opacity-30 transition"
        >
          Back
        </button>
        <button
          onClick={goNext}
          disabled={step === steps.length - 1}
          className="px-4 py-2 rounded bg-fuchsia-600 hover:bg-fuchsia-700 text-white transition disabled:opacity-30"
        >
          Next
        </button>
      </div>
    </div>
  );
}
