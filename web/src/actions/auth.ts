/**
 * Auth server actions.
 *
 * All actions return ActionResult<T> for consistent client-side handling.
 * Password is NEVER returned to the client.
 */

'use server';

import { AuthError } from 'next-auth';
import bcrypt from 'bcryptjs';
import { cache } from 'react';

import { signIn, signOut, auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { loginSchema, registerSchema } from '@/validations/auth';

// ─── Result Type ───────────────────────────────────────────────────────────────

export interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ─── Register ──────────────────────────────────────────────────────────────────

export async function registerAction(
  formData: FormData,
): Promise<ActionResult<{ onboardingComplete: boolean }>> {
  // 1. Parse & validate
  const raw = {
    username: formData.get('username'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? 'Invalid input';
    return { success: false, error: firstError };
  }

  const { username, email, password } = parsed.data;

  // 2. Check email uniqueness
  const existingEmail = await db.user.findUnique({ where: { email } });
  if (existingEmail) {
    return { success: false, error: 'An account with this email already exists' };
  }

  // 3. Check username uniqueness
  const existingUsername = await db.user.findUnique({ where: { username } });
  if (existingUsername) {
    return { success: false, error: 'This username is already taken' };
  }

  // 4. Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // 5. Create user
  // NOTE: Initial role is 'user' — actual role selection (artist, organizer, etc.)
  // happens in onboarding Step 1. This is just a placeholder default.
  await db.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
      roles: ['user'],
      onboardingComplete: false,
      onboardingStep: 0,
    },
  });

  // 6. Auto sign-in
  try {
    await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
  } catch (error) {
    // If sign-in fails after registration, still report success
    if (error instanceof AuthError) {
      return { success: true, data: { onboardingComplete: false } };
    }
    throw error;
  }

  return { success: true, data: { onboardingComplete: false } };
}

// ─── Login ─────────────────────────────────────────────────────────────────────

export async function loginAction(
  formData: FormData,
): Promise<ActionResult<{ onboardingComplete: boolean }>> {
  // 1. Parse & validate
  const raw = {
    email: formData.get('email'),
    password: formData.get('password'),
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? 'Invalid input';
    return { success: false, error: firstError };
  }

  const { email, password } = parsed.data;

  // 2. Sign in via NextAuth
  try {
    await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: 'Invalid email or password' };
    }
    throw error;
  }

  // 3. Get onboardingComplete from session
  const session = await auth();
  const onboardingComplete = session?.user?.onboardingComplete ?? false;

  return { success: true, data: { onboardingComplete } };
}

// ─── Logout ────────────────────────────────────────────────────────────────────

export async function logoutAction(): Promise<ActionResult<null>> {
  await signOut({ redirect: false });
  return { success: true, data: null };
}

// ─── Get Current User ──────────────────────────────────────────────────────────
// Not a server action — a cached async function for request-level deduplication.

export const getCurrentUser = cache(async () => {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      username: true,
      email: true,
      firstName: true,
      lastName: true,
      location: true,
      bio: true,
      roles: true,
      onboardingStep: true,
      onboardingComplete: true,
      profileImage: true,
      preferences: true,
      locationDetails: true,
      notificationPreferences: true,
      privacySettings: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
      // NEVER include password
    },
  });

  return user;
});
