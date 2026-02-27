import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Providers from '@/components/common/providers';
import { ThemeProvider } from '@/components/ui/theme-provider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'SoundTribe — Discover, Connect & Create Music',
    template: '%s | SoundTribe',
  },
  description:
    'SoundTribe connects musicians, organizers, and music enthusiasts. Find gigs, discover artists, and build your music career.',
  icons: { icon: '/icon.svg' },
  metadataBase: new URL(process.env.NEXTAUTH_URL ?? 'https://soundtribe.vercel.app'),
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
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans bg-background text-foreground min-h-screen`} suppressHydrationWarning>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-purple-600 focus:text-white focus:rounded-lg"
        >
          Skip to main content
        </a>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>{children}</Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
