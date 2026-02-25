import React from 'react';
import type { OnboardingState } from '@/hooks/use-onboarding';

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
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Your Location</h2>
      <div className="mb-2 text-gray-800">City:</div>
      <input
        type="text"
        className="w-full border rounded px-2 py-1 mb-2 text-gray-900 bg-gray-50"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="Enter your city"
      />
      <div className="mb-2 text-gray-800">Region:</div>
      <input
        type="text"
        className="w-full border rounded px-2 py-1 mb-2 text-gray-900 bg-gray-50"
        value={region}
        onChange={(e) => setRegion(e.target.value)}
        placeholder="Enter your region/state"
      />
      <div className="mb-2 text-gray-800">Willing to travel (km):</div>
      <input
        type="number"
        className="w-full border rounded px-2 py-1 mb-4 text-gray-900 bg-gray-50"
        value={willingToTravel}
        onChange={(e) => setWillingToTravel(Number(e.target.value))}
        min={0}
        max={1000}
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
