import React from 'react';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import OnboardingStepper from '@/components/onboarding/onboarding-stepper';

export default async function OnboardingPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  if (session.user.onboardingComplete) {
    redirect('/dashboard');
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100">
      <div className="w-full max-w-lg p-6 bg-white rounded-xl shadow-lg">
        <OnboardingStepper />
      </div>
    </main>
  );
}
