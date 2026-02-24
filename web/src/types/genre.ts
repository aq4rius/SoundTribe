/**
 * Genre types.
 *
 * CANONICAL: Prisma Genre model (import { Genre } from '@prisma/client').
 * TRANSITIONAL: IGenre (Express API shape with _id).
 */

import type { Genre as PrismaGenre } from '@prisma/client';

/** Re-export Prisma Genre type for convenience. */
export type Genre = PrismaGenre;

/**
 * @deprecated TRANSITIONAL — used by components still calling the Express API.
 */
export interface IGenre {
  _id: string;
  name: string;
  description?: string;
}
