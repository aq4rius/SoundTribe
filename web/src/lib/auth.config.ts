/**
 * Edge-compatible NextAuth configuration.
 *
 * This file contains ONLY config that can run on the Edge runtime.
 * NO Prisma, NO bcrypt — those are Node.js-only and live in lib/auth.ts.
 *
 * Used exclusively by middleware.ts for route protection.
 */

import type { NextAuthConfig } from 'next-auth';

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/auth/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAppRoute =
        nextUrl.pathname.startsWith('/dashboard') ||
        nextUrl.pathname.startsWith('/events') ||
        nextUrl.pathname.startsWith('/artists') ||
        nextUrl.pathname.startsWith('/chat') ||
        nextUrl.pathname.startsWith('/onboarding');
      const isAuthRoute = nextUrl.pathname.startsWith('/auth');

      if (isAppRoute && !isLoggedIn) return false;
      if (isAuthRoute && isLoggedIn) {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      return true;
    },
  },
  providers: [], // populated in auth.ts
};
