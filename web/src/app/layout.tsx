import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Providers from '@/components/common/providers';

export const metadata: Metadata = {
  title: 'SoundTribe — Discover, Connect & Create Music',
  description:
    'SoundTribe connects musicians, organizers, and music enthusiasts. Find gigs, discover artists, and build your music career.',
  openGraph: {
    title: 'SoundTribe',
    description:
      'The music community platform — find gigs, discover artists, connect with organizers.',
    type: 'website',
    siteName: 'SoundTribe',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-black text-white min-h-screen" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
