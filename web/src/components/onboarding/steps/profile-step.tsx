import React from 'react';
import type { OnboardingState } from '@/types/onboarding';

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
  [key: string]: unknown;
}) {
  const [bio, setBio] = React.useState(onboarding?.bio || '');
  // Add more fields as needed

  const handleContinue = async () => {
    await saveOnboarding({ bio, onboardingStep: 5 });
    goNext();
  };

  return (
    <div className="bg-white/10 rounded-xl shadow-lg border border-white/10 p-6">
      <h2 className="text-xl font-semibold mb-4 text-white">Profile Setup</h2>
      <div className="mb-2 text-white/80">Short Bio:</div>
      <textarea
        className="w-full border border-white/20 rounded px-2 py-1 mb-4 text-white bg-white/5 placeholder-white/40 focus:ring-2 focus:ring-cyan-400 focus:outline-none"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        placeholder="Tell us about yourself"
        rows={4}
      />
      <div className="flex justify-between">
        <button onClick={goBack} className="px-4 py-2 rounded bg-white/10 text-white/80 hover:bg-white/20 transition">
          Back
        </button>
        <button onClick={handleContinue} className="px-4 py-2 rounded bg-fuchsia-600 hover:bg-fuchsia-700 text-white transition">
          Continue
        </button>
      </div>
    </div>
  );
}
