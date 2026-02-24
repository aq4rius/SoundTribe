import React from 'react';
import OnboardingStepper from '@/components/onboarding/onboarding-stepper';

export default function OnboardingPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100">
      <div className="w-full max-w-lg p-6 bg-white rounded-xl shadow-lg">
        <OnboardingStepper />
      </div>
    </main>
  );
}
