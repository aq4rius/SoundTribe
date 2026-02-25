import React from 'react';
import type { OnboardingState } from '@/types/onboarding';

export default function RoleStep({
  goNext,
  onboarding,
  saveOnboarding,
}: {
  goNext: () => void;
  onboarding: OnboardingState | null;
  saveOnboarding: (data: Partial<OnboardingState>) => void;
}) {
  const [selected, setSelected] = React.useState<string[]>(onboarding?.roles || []);

  const handleSelect = (role: string) => {
    setSelected((prev) => (prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]));
  };

  const handleContinue = async () => {
    await saveOnboarding({ roles: selected, onboardingStep: 1 });
    goNext();
  };

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Select your role(s)</h2>
      <div className="flex flex-wrap gap-2 mb-4">
        {['artist', 'organizer', 'enthusiast', 'collaborator', 'networker'].map((role) => (
          <button
            key={role}
            type="button"
            className={`px-4 py-2 rounded ${selected.includes(role) ? 'bg-indigo-500 text-white' : 'bg-indigo-100 text-gray-900'}`}
            onClick={() => handleSelect(role)}
          >
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </button>
        ))}
      </div>
      <button
        onClick={handleContinue}
        className="mt-4 px-4 py-2 rounded bg-indigo-500 text-white"
        disabled={selected.length === 0}
      >
        Continue
      </button>
    </div>
  );
}
