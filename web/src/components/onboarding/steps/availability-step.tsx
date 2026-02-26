import React from 'react';
import type { OnboardingState } from '@/types/onboarding';

export default function AvailabilityStep({
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
  const [goals, setGoals] = React.useState<string[]>(onboarding?.preferences?.eventTypes || []);
  // TODO: Branch by role for more advanced logic
  const goalOptions = ['Gigs', 'Tours', 'Remote', 'Studio', 'Networking'];

  const handleContinue = async () => {
    await saveOnboarding({
      preferences: { ...onboarding?.preferences, eventTypes: goals },
      onboardingStep: 4,
    });
    goNext();
  };

  return (
    <div className="bg-white/10 rounded-xl shadow-lg border border-white/10 p-6">
      <h2 className="text-xl font-semibold mb-4 text-white">Availability & Goals</h2>
      <div className="mb-2 text-white/80">What are you looking for?</div>
      <div className="flex flex-wrap gap-2 mb-4">
        {goalOptions.map((g) => (
          <button
            key={g}
            type="button"
            className={`px-3 py-1 rounded-full border transition ${goals.includes(g) ? 'bg-fuchsia-600 text-white border-fuchsia-500' : 'bg-white/10 text-white/80 border-white/20 hover:bg-white/20'}`}
            onClick={() =>
              setGoals((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]))
            }
          >
            {g}
          </button>
        ))}
      </div>
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
