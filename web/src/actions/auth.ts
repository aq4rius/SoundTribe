/**
 * Auth server actions.
 *
 * All actions return ActionResult<T> for consistent client-side handling.
 * Password is NEVER returned to the client.
 */

'use server';

import { AuthError } from 'next-auth';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { cache } from 'react';

import { signIn, signOut, auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { loginSchema, registerSchema } from '@/validations/auth';
import type { ActionResult } from '@/types/actions';

export type { ActionResult };

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

// ─── Forgot Password ───────────────────────────────────────────────────────────

export async function forgotPasswordAction(
  email: string,
): Promise<ActionResult<{ message: string }>> {
  if (!email || typeof email !== 'string') {
    return { success: false, error: 'Email is required' };
  }

  const user = await db.user.findUnique({ where: { email } });
  // Always return success to prevent email enumeration
  if (!user) {
    return { success: true, data: { message: 'If an account exists, a reset link has been sent.' } };
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await db.user.update({
    where: { id: user.id },
    data: {
      resetPasswordToken: token,
      resetPasswordExpires: expires,
    },
  });

  // TODO(phase-4): Send email with reset link using a mailer service
  // The reset link would be: ${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}
  console.log(`[DEV] Password reset token for ${email}: ${token}`);

  return { success: true, data: { message: 'If an account exists, a reset link has been sent.' } };
}

// ─── Reset Password ────────────────────────────────────────────────────────────

export async function resetPasswordAction(
  token: string,
  newPassword: string,
): Promise<ActionResult<{ message: string }>> {
  if (!token || !newPassword) {
    return { success: false, error: 'Token and new password are required' };
  }
  if (newPassword.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters' };
  }

  const user = await db.user.findFirst({
    where: {
      resetPasswordToken: token,
      resetPasswordExpires: { gt: new Date() },
    },
  });

  if (!user) {
    return { success: false, error: 'Invalid or expired reset token' };
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await db.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    },
  });

  return { success: true, data: { message: 'Password has been reset successfully' } };
}

// ─── Verify Email ──────────────────────────────────────────────────────────────

export async function verifyEmailAction(
  token: string,
): Promise<ActionResult<{ message: string }>> {
  if (!token) {
    return { success: false, error: 'Verification token is required' };
  }

  const user = await db.user.findFirst({
    where: {
      emailVerificationToken: token,
      emailVerificationExpires: { gt: new Date() },
    },
  });

  if (!user) {
    return { success: false, error: 'Invalid or expired verification token' };
  }

  await db.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null,
    },
  });

  return { success: true, data: { message: 'Email verified successfully' } };
}

// ─── Resend Verification Email ─────────────────────────────────────────────────

export async function resendVerificationAction(
  email: string,
): Promise<ActionResult<{ message: string }>> {
  if (!email || typeof email !== 'string') {
    return { success: false, error: 'Email is required' };
  }

  const user = await db.user.findUnique({ where: { email } });
  // Always return success to prevent email enumeration
  if (!user || user.emailVerified) {
    return { success: true, data: { message: 'If applicable, a verification email has been sent.' } };
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await db.user.update({
    where: { id: user.id },
    data: {
      emailVerificationToken: token,
      emailVerificationExpires: expires,
    },
  });

  // TODO(phase-4): Send verification email using a mailer service
  // The verification link: ${process.env.NEXTAUTH_URL}/auth/verify-email?token=${token}
  console.log(`[DEV] Email verification token for ${email}: ${token}`);

  return { success: true, data: { message: 'If applicable, a verification email has been sent.' } };
}
