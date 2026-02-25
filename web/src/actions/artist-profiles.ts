'use server';

import { revalidatePath } from 'next/cache';

import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { requireAuth, hasRole, withActionHandler } from '@/lib/action-utils';
import { createArtistProfileSchema } from '@/validations/artist-profiles';
import type { ActionResult } from '@/types/actions';
import type { PrismaArtistProfile, PrismaArtistProfileCard } from '@/types/artist';

// ─── Get Artist Profiles (public, paginated) ──────────────────────────────────

export async function getArtistProfilesAction(filters?: {
  genres?: string[];
  instruments?: string[];
  location?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<
  ActionResult<{ profiles: PrismaArtistProfileCard[]; total: number; totalPages: number }>
> {
  return withActionHandler(async () => {
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 12;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (filters?.search) {
      where.stageName = { contains: filters.search, mode: 'insensitive' };
    }
    if (filters?.location) {
      where.location = { contains: filters.location, mode: 'insensitive' };
    }
    if (filters?.genres && filters.genres.length > 0) {
      where.genres = { some: { id: { in: filters.genres } } };
    }
    if (filters?.instruments && filters.instruments.length > 0) {
      where.instruments = { hasSome: filters.instruments };
    }

    const [profiles, total] = await Promise.all([
      db.artistProfile.findMany({
        where,
        select: {
          id: true,
          stageName: true,
          location: true,
          profileImage: true,
          instruments: true,
          ratePerHour: true,
          genres: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.artistProfile.count({ where }),
    ]);

    return {
      profiles: profiles as PrismaArtistProfileCard[],
      total,
      totalPages: Math.ceil(total / limit),
    };
  });
}

// ─── Get Artist Profile By ID (public) ────────────────────────────────────────

export async function getArtistProfileByIdAction(
  id: string,
): Promise<ActionResult<PrismaArtistProfile>> {
  return withActionHandler(async () => {
    const profile = await db.artistProfile.findUnique({
      where: { id },
      include: {
        genres: true,
        user: { select: { id: true, username: true, profileImage: true } },
      },
    });

    if (!profile) throw new Error('Artist profile not found');
    return profile as PrismaArtistProfile;
  });
}

// ─── Get My Artist Profile ─────────────────────────────────────────────────────

export async function getMyArtistProfileAction(): Promise<
  ActionResult<PrismaArtistProfile | null>
> {
  const authResult = await requireAuth();
  if ('error' in authResult) return { success: false, error: authResult.error };
  const { session } = authResult;

  return withActionHandler(async () => {
    const profile = await db.artistProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        genres: true,
        user: { select: { id: true, username: true, profileImage: true } },
      },
    });

    return (profile as PrismaArtistProfile) ?? null;
  });
}

// ─── Create or Update Artist Profile ───────────────────────────────────────────

export async function createOrUpdateArtistProfileAction(
  formData: FormData,
): Promise<ActionResult<PrismaArtistProfile>> {
  const authResult = await requireAuth();
  if ('error' in authResult) return { success: false, error: authResult.error };
  const { session } = authResult;

  if (!hasRole(session.user.roles, 'artist')) {
    return { success: false, error: 'You must have the artist role to manage artist profiles' };
  }

  const raw = {
    stageName: formData.get('stageName') as string,
    biography: (formData.get('biography') as string) || '',
    genres: formData.getAll('genres') as string[],
    instruments: formData.getAll('instruments').length > 0
      ? (formData.getAll('instruments') as string[]).flatMap((i) =>
          i.split(',').map((s) => s.trim()).filter(Boolean),
        )
      : [],
    location: formData.get('location') as string,
    yearsOfExperience: Number(formData.get('yearsOfExperience') || 0),
    ratePerHour: formData.get('ratePerHour')
      ? Number(formData.get('ratePerHour'))
      : null,
    websiteUrl: (formData.get('websiteUrl') as string) || '',
    socialMediaLinks: formData.get('socialMediaLinks')
      ? JSON.parse(formData.get('socialMediaLinks') as string)
      : {
          facebook: (formData.get('facebook') as string) || '',
          instagram: (formData.get('instagram') as string) || '',
          twitter: (formData.get('twitter') as string) || '',
          youtube: (formData.get('youtube') as string) || '',
          tiktok: (formData.get('tiktok') as string) || '',
          other: (formData.get('other') as string) || '',
        },
  };

  // Handle genres passed as JSON array string
  if (raw.genres.length === 0) {
    const genresJson = formData.get('genresJson') as string;
    if (genresJson) {
      try {
        raw.genres = JSON.parse(genresJson);
      } catch {
        // leave empty
      }
    }
  }

  const parsed = createArtistProfileSchema.safeParse(raw);
  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? 'Invalid input';
    return { success: false, error: firstError };
  }

  return withActionHandler(async () => {
    const profile = await db.artistProfile.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        stageName: parsed.data.stageName,
        biography: parsed.data.biography || null,
        instruments: parsed.data.instruments,
        yearsOfExperience: parsed.data.yearsOfExperience,
        location: parsed.data.location,
        websiteUrl: parsed.data.websiteUrl || null,
        socialMediaLinks: parsed.data.socialMediaLinks ?? Prisma.JsonNull,
        ratePerHour: parsed.data.ratePerHour ?? null,
        genres: { connect: parsed.data.genres.map((id) => ({ id })) },
      },
      update: {
        stageName: parsed.data.stageName,
        biography: parsed.data.biography || null,
        instruments: parsed.data.instruments,
        yearsOfExperience: parsed.data.yearsOfExperience,
        location: parsed.data.location,
        websiteUrl: parsed.data.websiteUrl || null,
        socialMediaLinks: parsed.data.socialMediaLinks ?? Prisma.JsonNull,
        ratePerHour: parsed.data.ratePerHour ?? null,
        genres: {
          set: [], // disconnect all first
          connect: parsed.data.genres.map((id) => ({ id })),
        },
      },
      include: {
        genres: true,
        user: { select: { id: true, username: true, profileImage: true } },
      },
    });

    revalidatePath('/artists');
    revalidatePath('/dashboard');
    return profile as PrismaArtistProfile;
  });
}

// ─── Delete Artist Profile ─────────────────────────────────────────────────────

export async function deleteArtistProfileAction(
  id: string,
): Promise<ActionResult<void>> {
  const authResult = await requireAuth();
  if ('error' in authResult) return { success: false, error: authResult.error };
  const { session } = authResult;

  return withActionHandler(async () => {
    const profile = await db.artistProfile.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!profile) throw new Error('Artist profile not found');
    if (profile.userId !== session.user.id) {
      throw new Error('You can only delete your own artist profile');
    }

    await db.artistProfile.delete({ where: { id } });
    revalidatePath('/artists');
    revalidatePath('/dashboard');
  });
}
