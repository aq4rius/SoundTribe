import React from 'react';
import type { OnboardingState } from '@/types/onboarding';

export default function NotificationsStep({
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
  const [email, setEmail] = React.useState(onboarding?.notificationPreferences?.email ?? true);
  const [push, setPush] = React.useState(onboarding?.notificationPreferences?.push ?? true);

  const handleContinue = async () => {
    await saveOnboarding({ notificationPreferences: { email, push }, onboardingStep: 6 });
    goNext();
  };

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Notifications & Feed</h2>
      <div className="mb-2 text-gray-800">How would you like to be notified?</div>
      <div className="flex flex-col gap-2 mb-4">
        <label className="flex items-center gap-2 text-gray-900">
          <input type="checkbox" checked={email} onChange={(e) => setEmail(e.target.checked)} />
          Email notifications
        </label>
        <label className="flex items-center gap-2 text-gray-900">
          <input type="checkbox" checked={push} onChange={(e) => setPush(e.target.checked)} />
          Push notifications
        </label>
      </div>
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
