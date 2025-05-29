import React from 'react';

export default function AvailabilityStep({ goNext, goBack, onboarding, saveOnboarding }: { goNext: () => void; goBack: () => void; onboarding: any; saveOnboarding: (data: any) => void }) {
  const [goals, setGoals] = React.useState<string[]>(onboarding?.preferences?.eventTypes || []);
  // TODO: Branch by role for more advanced logic
  const goalOptions = ['Gigs', 'Tours', 'Remote', 'Studio', 'Networking'];

  const handleContinue = async () => {
    await saveOnboarding({ preferences: { ...onboarding?.preferences, eventTypes: goals }, onboardingStep: 4 });
    goNext();
  };

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Availability & Goals</h2>
      <div className="mb-2 text-gray-800">What are you looking for?</div>
      <div className="flex flex-wrap gap-2 mb-4">
        {goalOptions.map((g) => (
          <button
            key={g}
            type="button"
            className={`px-3 py-1 rounded-full border ${goals.includes(g) ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-900'}`}
            onClick={() => setGoals((prev) => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])}
          >
            {g}
          </button>
        ))}
      </div>
      <div className="flex justify-between">
        <button onClick={goBack} className="px-4 py-2 rounded bg-gray-200 text-gray-900">Back</button>
        <button onClick={handleContinue} className="px-4 py-2 rounded bg-indigo-500 text-white">Continue</button>
      </div>
    </div>
  );
}
