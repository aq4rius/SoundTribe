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
  [key: string]: unknown;
}) {
  const [email, setEmail] = React.useState(onboarding?.notificationPreferences?.email ?? true);
  const [push, setPush] = React.useState(onboarding?.notificationPreferences?.push ?? true);

  const handleContinue = async () => {
    await saveOnboarding({ notificationPreferences: { email, push }, onboardingStep: 6 });
    goNext();
  };

  return (
    <div className="bg-white/10 rounded-xl shadow-lg border border-white/10 p-6">
      <h2 className="text-xl font-semibold mb-4 text-white">Notifications & Feed</h2>
      <div className="mb-2 text-white/80">How would you like to be notified?</div>
      <div className="flex flex-col gap-2 mb-4">
        <label className="flex items-center gap-2 text-white/80">
          <input type="checkbox" checked={email} onChange={(e) => setEmail(e.target.checked)} className="accent-fuchsia-500" />
          Email notifications
        </label>
        <label className="flex items-center gap-2 text-white/80">
          <input type="checkbox" checked={push} onChange={(e) => setPush(e.target.checked)} className="accent-fuchsia-500" />
          Push notifications
        </label>
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
