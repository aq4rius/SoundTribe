'use server';

import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';

import { db } from '@/lib/db';
import { requireAuth, withActionHandler } from '@/lib/action-utils';
import {
  updateProfileSchema,
  changePasswordSchema,
  updateAccountSettingsSchema,
} from '@/validations/users';
import type { ActionResult } from '@/types/actions';
import type { PrismaUserFull } from '@/types/auth';

// ─── Update Profile (edit-profile page) ────────────────────────────────────────

export async function updateProfileAction(
  formData: FormData,
): Promise<ActionResult<PrismaUserFull>> {
  const authResult = await requireAuth();
  if ('error' in authResult) return { success: false, error: authResult.error };
  const { session } = authResult;

  const raw = {
    username: formData.get('username') as string,
    firstName: (formData.get('firstName') as string) || '',
    lastName: (formData.get('lastName') as string) || '',
    bio: (formData.get('bio') as string) || '',
    location: (formData.get('location') as string) || '',
  };

  const parsed = updateProfileSchema.safeParse(raw);
  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? 'Invalid input';
    return { success: false, error: firstError };
  }

  return withActionHandler(async () => {
    // Check username uniqueness (exclude current user)
    const existingUsername = await db.user.findFirst({
      where: {
        username: parsed.data.username,
        NOT: { id: session.user.id },
      },
    });
    if (existingUsername) {
      throw new Error('This username is already taken');
    }

    const user = await db.user.update({
      where: { id: session.user.id },
      data: {
        username: parsed.data.username,
        firstName: parsed.data.firstName || null,
        lastName: parsed.data.lastName || null,
        bio: parsed.data.bio || null,
        location: parsed.data.location || null,
      },
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
      },
    });

    revalidatePath('/dashboard');
    return user as PrismaUserFull;
  });
}

// ─── Update Account Settings ───────────────────────────────────────────────────

export async function updateAccountSettingsAction(
  formData: FormData,
): Promise<ActionResult<PrismaUserFull>> {
  const authResult = await requireAuth();
  if ('error' in authResult) return { success: false, error: authResult.error };
  const { session } = authResult;

  const raw = {
    firstName: (formData.get('firstName') as string) || '',
    lastName: (formData.get('lastName') as string) || '',
    location: (formData.get('location') as string) || '',
    bio: (formData.get('bio') as string) || '',
    preferences: formData.get('preferences')
      ? JSON.parse(formData.get('preferences') as string)
      : undefined,
    locationDetails: formData.get('locationDetails')
      ? JSON.parse(formData.get('locationDetails') as string)
      : undefined,
    notificationPreferences: formData.get('notificationPreferences')
      ? JSON.parse(formData.get('notificationPreferences') as string)
      : undefined,
    privacySettings: formData.get('privacySettings')
      ? JSON.parse(formData.get('privacySettings') as string)
      : undefined,
  };

  const parsed = updateAccountSettingsSchema.safeParse(raw);
  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? 'Invalid input';
    return { success: false, error: firstError };
  }

  return withActionHandler(async () => {
    const user = await db.user.update({
      where: { id: session.user.id },
      data: {
        firstName: parsed.data.firstName || null,
        lastName: parsed.data.lastName || null,
        location: parsed.data.location || null,
        bio: parsed.data.bio || null,
        ...(parsed.data.preferences !== undefined && {
          preferences: parsed.data.preferences,
        }),
        ...(parsed.data.locationDetails !== undefined && {
          locationDetails: parsed.data.locationDetails,
        }),
        ...(parsed.data.notificationPreferences !== undefined && {
          notificationPreferences: parsed.data.notificationPreferences,
        }),
        ...(parsed.data.privacySettings !== undefined && {
          privacySettings: parsed.data.privacySettings,
        }),
      },
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
      },
    });

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/account-settings');
    return user as PrismaUserFull;
  });
}

// ─── Update Notification Preferences ───────────────────────────────────────────

export async function updateNotificationPreferencesAction(
  preferences: { email: boolean; push: boolean },
): Promise<ActionResult<void>> {
  const authResult = await requireAuth();
  if ('error' in authResult) return { success: false, error: authResult.error };
  const { session } = authResult;

  return withActionHandler(async () => {
    await db.user.update({
      where: { id: session.user.id },
      data: { notificationPreferences: preferences },
    });
    revalidatePath('/dashboard/notifications');
  });
}

// ─── Change Password ───────────────────────────────────────────────────────────

export async function changePasswordAction(
  formData: FormData,
): Promise<ActionResult<void>> {
  const authResult = await requireAuth();
  if ('error' in authResult) return { success: false, error: authResult.error };
  const { session } = authResult;

  const raw = {
    currentPassword: formData.get('currentPassword') as string,
    newPassword: formData.get('newPassword') as string,
    confirmNewPassword: formData.get('confirmNewPassword') as string,
  };

  const parsed = changePasswordSchema.safeParse(raw);
  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? 'Invalid input';
    return { success: false, error: firstError };
  }

  return withActionHandler(async () => {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { password: true },
    });

    if (!user) throw new Error('User not found');

    const isMatch = await bcrypt.compare(parsed.data.currentPassword, user.password);
    if (!isMatch) throw new Error('Current password is incorrect');

    const hashedPassword = await bcrypt.hash(parsed.data.newPassword, 12);
    await db.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    });
  });
}

// ─── Update Onboarding State ───────────────────────────────────────────────────

export async function updateOnboardingAction(
  data: Record<string, unknown>,
): Promise<ActionResult<void>> {
  const authResult = await requireAuth();
  if ('error' in authResult) return { success: false, error: authResult.error };
  const { session } = authResult;

  return withActionHandler(async () => {
    const updateData: Record<string, unknown> = {};

    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.roles !== undefined) updateData.roles = data.roles;
    if (data.onboardingStep !== undefined) updateData.onboardingStep = data.onboardingStep;
    if (data.onboardingComplete !== undefined)
      updateData.onboardingComplete = data.onboardingComplete;
    if (data.preferences !== undefined) updateData.preferences = data.preferences;
    if (data.locationDetails !== undefined) updateData.locationDetails = data.locationDetails;
    if (data.notificationPreferences !== undefined)
      updateData.notificationPreferences = data.notificationPreferences;
    if (data.privacySettings !== undefined) updateData.privacySettings = data.privacySettings;

    await db.user.update({
      where: { id: session.user.id },
      data: updateData,
    });

    revalidatePath('/dashboard');
    revalidatePath('/onboarding');
  });
}

// ─── Get Onboarding State ──────────────────────────────────────────────────────

export async function getOnboardingStateAction(): Promise<
  ActionResult<{
    onboardingStep: number;
    onboardingComplete: boolean;
    roles: string[];
    preferences: unknown;
    locationDetails: unknown;
    notificationPreferences: unknown;
    bio: string | null;
  }>
> {
  const authResult = await requireAuth();
  if ('error' in authResult) return { success: false, error: authResult.error };
  const { session } = authResult;

  return withActionHandler(async () => {
    const user = await db.user.findUniqueOrThrow({
      where: { id: session.user.id },
      select: {
        onboardingStep: true,
        onboardingComplete: true,
        roles: true,
        preferences: true,
        locationDetails: true,
        notificationPreferences: true,
        bio: true,
      },
    });

    return {
      onboardingStep: user.onboardingStep,
      onboardingComplete: user.onboardingComplete,
      roles: user.roles,
      preferences: user.preferences,
      locationDetails: user.locationDetails,
      notificationPreferences: user.notificationPreferences,
      bio: user.bio,
    };
  });
}
