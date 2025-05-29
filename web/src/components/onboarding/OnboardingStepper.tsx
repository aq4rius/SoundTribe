"use client";

import React, { useState } from 'react';
import RoleStep from './steps/RoleStep';
import PreferencesStep from './steps/PreferencesStep';
import LocationStep from './steps/LocationStep';
import AvailabilityStep from './steps/AvailabilityStep';
import ProfileStep from './steps/ProfileStep';
import NotificationsStep from './steps/NotificationsStep';
import SummaryStep from './steps/SummaryStep';
import { useOnboarding } from '../../hooks/useOnboarding';

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
  const [step, setStep] = useState(0);
  const StepComponent = steps[step].component;
  const { onboarding, loading, error, saveOnboarding } = useOnboarding();

  const goNext = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  // Optionally, show loading or error
  if (loading) return <div className="text-center py-8">Loading onboarding...</div>;
  if (error) return <div className="text-center text-red-500 py-8">{error}</div>;

  return (
    <div className="bg-white min-h-[500px] rounded-xl shadow p-4 sm:p-8">
      <div className="flex items-center mb-6">
        {steps.map((s, i) => (
          <div key={s.label} className={`flex-1 text-center ${i === step ? 'font-bold text-indigo-600' : 'text-gray-400'}`}>{s.label}</div>
        ))}
      </div>
      <div className="mb-4">
        <StepComponent
          goNext={goNext}
          goBack={goBack}
          onboarding={onboarding}
          saveOnboarding={saveOnboarding}
        />
      </div>
      <div className="flex justify-between">
        <button onClick={goBack} disabled={step === 0} className="px-4 py-2 rounded bg-gray-200 text-gray-900 disabled:opacity-50">Back</button>
        <button onClick={goNext} disabled={step === steps.length - 1} className="px-4 py-2 rounded bg-indigo-500 text-white">Next</button>
      </div>
    </div>
  );
}
