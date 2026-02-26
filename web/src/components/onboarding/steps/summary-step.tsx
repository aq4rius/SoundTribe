import React from 'react';
import type { OnboardingState } from '@/types/onboarding';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

export default function SummaryStep({
  goBack,
  saveOnboarding,
  onSessionUpdate,
  router,
}: {
  goBack: () => void;
  onboarding: OnboardingState | null;
  saveOnboarding: (data: Partial<OnboardingState>) => void;
  onSessionUpdate?: () => Promise<unknown>;
  router?: AppRouterInstance;
}) {
  const handleFinish = async () => {
    await saveOnboarding({ onboardingComplete: true, onboardingStep: 7 });
    // Re-issue the JWT with the updated roles/onboardingComplete flag
    if (onSessionUpdate) await onSessionUpdate();
    if (router) {
      router.refresh();
      router.push('/dashboard');
    } else {
      window.location.href = '/dashboard';
    }
  };

  return (
    <div className="rounded-xl p-6">
      <h2 className="text-xl font-semibold mb-4 text-white">Welcome to SoundTribe!</h2>
      <div className="mb-4 text-white/70">
        Your onboarding is complete. Enjoy a personalized experience!
      </div>
      <div className="flex justify-between">
        <button onClick={goBack} className="px-4 py-2 rounded bg-white/10 text-white/80 hover:bg-white/20 transition">
          Back
        </button>
        <button onClick={handleFinish} className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white transition">
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
