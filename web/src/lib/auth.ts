/**
 * NextAuth v5 configuration — next-auth@5.0.0-beta.30
 *
 * Strategy: JWT (stateless, Vercel Edge compatible)
 * Provider: Credentials (email + password)
 *
 * NOTE: No adapter — Credentials provider requires JWT strategy and is
 * incompatible with a database adapter for session management. The db
 * client is still used directly inside the authorize() callback.
 *
 * Password is NEVER included in session, JWT, or any client-facing type.
 */

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

import { db } from '@/lib/db';
import { authConfig } from '@/lib/auth.config';

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // 1. Validate credentials shape
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        // 2. Find user by email — explicit select, NEVER select *
        const user = await db.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            username: true,
            password: true, // needed for comparison only — never forwarded
            roles: true,
            onboardingComplete: true,
            onboardingStep: true,
            profileImage: true,
          },
        });

        // 3. No user found
        if (!user) return null;

        // 4. Compare passwords
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) return null;

        // 5. Return user WITHOUT password
        return {
          id: user.id,
          email: user.email,
          username: user.username,
          roles: user.roles,
          onboardingComplete: user.onboardingComplete,
          onboardingStep: user.onboardingStep,
          profileImage: user.profileImage,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      // Initial sign-in — populate token from the user object returned by authorize()
      if (user) {
        token.id = user.id;
        token.roles = user.roles;
        token.onboardingComplete = user.onboardingComplete;
        token.onboardingStep = user.onboardingStep;
        token.username = user.username;
        token.profileImage = user.profileImage ?? null;
      }

      // Session update — re-read user from DB so roles/onboarding changes
      // are reflected in the JWT without requiring a full re-login.
      // Triggered by calling `update()` from useSession() on the client.
      if (trigger === 'update' && token.id) {
        const freshUser = await db.user.findUnique({
          where: { id: token.id as string },
          select: {
            roles: true,
            onboardingComplete: true,
            onboardingStep: true,
            username: true,
            profileImage: true,
          },
        });
        if (freshUser) {
          token.roles = freshUser.roles;
          token.onboardingComplete = freshUser.onboardingComplete;
          token.onboardingStep = freshUser.onboardingStep;
          token.username = freshUser.username;
          token.profileImage = freshUser.profileImage ?? null;
        }
      }

      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.roles = token.roles as import('@prisma/client').UserRole[];
      session.user.onboardingComplete = token.onboardingComplete as boolean;
      session.user.onboardingStep = token.onboardingStep as number;
      session.user.username = token.username as string;
      session.user.profileImage = token.profileImage as string | null;
      return session;
    },
  },
});
