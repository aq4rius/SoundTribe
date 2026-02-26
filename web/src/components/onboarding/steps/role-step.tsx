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
  [key: string]: unknown;
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
    <div className="rounded-xl p-6">
      <h2 className="text-xl font-semibold mb-4 text-white">Select your role(s)</h2>
      <div className="flex flex-wrap gap-2 mb-4">
        {['artist', 'organizer', 'enthusiast', 'collaborator', 'networker'].map((role) => (
          <button
            key={role}
            type="button"
            className={`px-4 py-2 rounded transition ${selected.includes(role) ? 'bg-fuchsia-600 text-white' : 'bg-white/10 text-white/80 hover:bg-white/20'}`}
            onClick={() => handleSelect(role)}
          >
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </button>
        ))}
      </div>
      <button
        onClick={handleContinue}
        className="mt-4 px-4 py-2 rounded bg-fuchsia-600 hover:bg-fuchsia-700 text-white transition"
        disabled={selected.length === 0}
      >
        Continue
      </button>
    </div>
  );
}
