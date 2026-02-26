import React from 'react';
import type { OnboardingState } from '@/types/onboarding';

export default function LocationStep({
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
  const [city, setCity] = React.useState(onboarding?.locationDetails?.city || '');
  const [region, setRegion] = React.useState(onboarding?.locationDetails?.region || '');
  const [willingToTravel, setWillingToTravel] = React.useState(
    onboarding?.locationDetails?.willingToTravel || 0,
  );

  const handleContinue = async () => {
    await saveOnboarding({ locationDetails: { city, region, willingToTravel }, onboardingStep: 3 });
    goNext();
  };

  return (
    <div className="bg-white/10 rounded-xl shadow-lg border border-white/10 p-6">
      <h2 className="text-xl font-semibold mb-4 text-white">Your Location</h2>
      <div className="mb-2 text-white/80">City:</div>
      <input
        type="text"
        className="w-full border border-white/20 rounded px-2 py-1 mb-2 text-white bg-white/5 placeholder-white/40 focus:ring-2 focus:ring-cyan-400 focus:outline-none"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="Enter your city"
      />
      <div className="mb-2 text-white/80">Region:</div>
      <input
        type="text"
        className="w-full border border-white/20 rounded px-2 py-1 mb-2 text-white bg-white/5 placeholder-white/40 focus:ring-2 focus:ring-cyan-400 focus:outline-none"
        value={region}
        onChange={(e) => setRegion(e.target.value)}
        placeholder="Enter your region/state"
      />
      <div className="mb-2 text-white/80">Willing to travel (km):</div>
      <input
        type="number"
        className="w-full border border-white/20 rounded px-2 py-1 mb-4 text-white bg-white/5 placeholder-white/40 focus:ring-2 focus:ring-cyan-400 focus:outline-none"
        value={willingToTravel}
        onChange={(e) => setWillingToTravel(Number(e.target.value))}
        min={0}
        max={1000}
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
