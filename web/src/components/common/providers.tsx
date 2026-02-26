'use client';
import { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';

export default function Providers({ children }: { children: ReactNode }) {
  // refetchOnWindowFocus: re-syncs session whenever the tab regains focus.
  // This catches sign-outs in other tabs and keeps the navbar in sync.
  return <SessionProvider refetchOnWindowFocus={true}>{children}</SessionProvider>;
}
