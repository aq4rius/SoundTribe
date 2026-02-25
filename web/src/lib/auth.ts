/**
 * NextAuth v5 configuration — next-auth@5.0.0-beta.30
 *
 * Strategy: JWT (stateless, Vercel Edge compatible)
 * Provider: Credentials (email + password)
 * Adapter: PrismaAdapter for user storage
 *
 * Password is NEVER included in session, JWT, or any client-facing type.
 */

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
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
  // TODO(phase-3): remove `as any` when @auth/prisma-adapter ships stable types matching next-auth v5 GA\n  adapter: PrismaAdapter(db) as any, // eslint-disable-line @typescript-eslint/no-explicit-any
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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.roles = user.roles;
        token.onboardingComplete = user.onboardingComplete;
        token.onboardingStep = user.onboardingStep;
        token.username = user.username;
        token.profileImage = user.profileImage ?? null;
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
