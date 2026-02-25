'use server';

import { db } from '@/lib/db';
import { requireAuth, withActionHandler } from '@/lib/action-utils';
import type { ActionResult } from '@/types/actions';
import type { Prisma } from '@prisma/client';

// ─── Search / Discovery ────────────────────────────────────────────────────────

export interface ArtistSearchFilters {
  search?: string;
  genres?: string[];
  instruments?: string[];
  location?: string;
  minExperience?: number;
  page?: number;
  limit?: number;
}

export async function searchArtistsAction(
  filters: ArtistSearchFilters = {},
): Promise<
  ActionResult<{
    data: Awaited<ReturnType<typeof db.artistProfile.findMany>>;
    totalPages: number;
    total: number;
  }>
> {
  return withActionHandler(async () => {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 12;
    const skip = (page - 1) * limit;

    const where: Prisma.ArtistProfileWhereInput = {};

    if (filters.search) {
      where.OR = [
        { stageName: { contains: filters.search, mode: 'insensitive' } },
        { biography: { contains: filters.search, mode: 'insensitive' } },
        { location: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.genres && filters.genres.length > 0) {
      where.genres = { some: { id: { in: filters.genres } } };
    }

    if (filters.instruments && filters.instruments.length > 0) {
      where.instruments = { hasSome: filters.instruments };
    }

    if (filters.location) {
      where.location = { contains: filters.location, mode: 'insensitive' };
    }

    if (filters.minExperience !== undefined) {
      where.yearsOfExperience = { gte: filters.minExperience };
    }

    const [artists, total] = await Promise.all([
      db.artistProfile.findMany({
        where,
        include: {
          genres: { select: { id: true, name: true } },
          user: { select: { id: true, username: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.artistProfile.count({ where }),
    ]);

    return { data: artists, totalPages: Math.ceil(total / limit), total };
  });
}

/**
 * Suggest artists based on shared genres with the current user's artist profile.
 * Excludes the current user. Returns up to 6.
 */
export async function getSuggestedArtistsAction(): Promise<
  ActionResult<Awaited<ReturnType<typeof db.artistProfile.findMany>>>
> {
  return withActionHandler(async () => {
    const auth = await requireAuth();
    if ('error' in auth) throw new Error(auth.error);

    // Get current user's artist profile with genres
    const myProfile = await db.artistProfile.findUnique({
      where: { userId: auth.session.user.id },
      include: { genres: { select: { id: true } } },
    });

    if (!myProfile) {
      // No artist profile → empty suggestions
      return [];
    }

    const myGenreIds = myProfile.genres.map((g) => g.id);

    if (myGenreIds.length === 0) return [];

    return db.artistProfile.findMany({
      where: {
        userId: { not: auth.session.user.id },
        genres: { some: { id: { in: myGenreIds } } },
      },
      include: {
        genres: { select: { id: true, name: true } },
        user: { select: { id: true, username: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 6,
    });
  });
}
