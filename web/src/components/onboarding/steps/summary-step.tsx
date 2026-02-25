import React from 'react';
import type { OnboardingState } from '@/types/onboarding';

export default function SummaryStep({
  goBack,
  saveOnboarding,
}: {
  goBack: () => void;
  onboarding: OnboardingState | null;
  saveOnboarding: (data: Partial<OnboardingState>) => void;
}) {
  const handleFinish = async () => {
    await saveOnboarding({ onboardingComplete: true, onboardingStep: 7 });
    // TODO: redirect to dashboard or show welcome
    window.location.href = '/dashboard';
  };

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Welcome to SoundTribe!</h2>
      <div className="mb-4 text-gray-800">
        Your onboarding is complete. Enjoy a personalized experience!
      </div>
      <div className="flex justify-between">
        <button onClick={goBack} className="px-4 py-2 rounded bg-gray-200 text-gray-900">
          Back
        </button>
        <button onClick={handleFinish} className="px-4 py-2 rounded bg-green-500 text-white">
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
