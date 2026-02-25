import React from 'react';
import type { OnboardingState } from '@/hooks/use-onboarding';

export default function ProfileStep({
  goNext,
  goBack,
  onboarding,
  saveOnboarding,
}: {
  goNext: () => void;
  goBack: () => void;
  onboarding: OnboardingState | null;
  saveOnboarding: (data: Partial<OnboardingState>) => void;
}) {
  const [bio, setBio] = React.useState(onboarding?.bio || '');
  // Add more fields as needed

  const handleContinue = async () => {
    await saveOnboarding({ bio, onboardingStep: 5 });
    goNext();
  };

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Profile Setup</h2>
      <div className="mb-2 text-gray-800">Short Bio:</div>
      <textarea
        className="w-full border rounded px-2 py-1 mb-4 text-gray-900 bg-gray-50"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        placeholder="Tell us about yourself"
        rows={4}
      />
      <div className="flex justify-between">
        <button onClick={goBack} className="px-4 py-2 rounded bg-gray-200 text-gray-900">
          Back
        </button>
        <button onClick={handleContinue} className="px-4 py-2 rounded bg-indigo-500 text-white">
          Continue
        </button>
      </div>
    </div>
  );
}
