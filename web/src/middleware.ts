import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';
import { authConfig } from '@/lib/auth.config';

const { auth } = NextAuth(authConfig);

/**
 * Public routes — always accessible regardless of auth state.
 */
const PUBLIC_ROUTES = [
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
  // Public browse pages — viewing is open, actions require auth
  '/artists',
  '/events',
];

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth?.user;

  const isPublicRoute = PUBLIC_ROUTES.includes(nextUrl.pathname);
  const isAuthRoute = nextUrl.pathname.startsWith('/auth/');

  // Authenticated users visiting auth pages (/auth/login etc.) → dashboard
  if (isLoggedIn && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', nextUrl));
  }

  // Unauthenticated users visiting a non-public route → login
  if (!isLoggedIn && !isPublicRoute && !isAuthRoute) {
    return NextResponse.redirect(new URL('/auth/login', nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  // api/auth must be listed first so NextAuth's own route handler is never
  // intercepted by this middleware wrapper — Vercel routes it directly.
  matcher: [
    '/((?!api/auth|api|_next/static|_next/image|favicon.ico|icon.svg|robots.txt|sitemap.xml|opengraph-image).*)',
  ],
};
