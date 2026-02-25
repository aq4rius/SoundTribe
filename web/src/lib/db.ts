import { PrismaClient, Prisma } from '@prisma/client';

/**
 * Prisma client singleton.
 *
 * In development, Next.js hot-reloads modules which would create a new
 * PrismaClient on every reload — exhausting the database connection pool.
 * This pattern stores the client on `globalThis` so it survives reloads.
 *
 * @see https://www.prisma.io/docs/orm/more/help-and-troubleshooting/nextjs-help
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/** Shared Prisma client instance. Import this in server components and API routes. */
export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}

// ─── Typed Error Handler ───────────────────────────────────────────────────────

/**
 * Wraps a Prisma operation with typed error handling.
 *
 * Converts Prisma-specific errors into human-readable messages
 * so raw database errors never reach the client.
 *
 * @param operation - An async function that performs a Prisma query.
 * @param context - Optional label for the entity/operation (used in error messages).
 * @returns The result of the Prisma operation.
 * @throws A plain `Error` with a user-friendly message.
 *
 * @example
 * ```ts
 * const user = await dbQuery(
 *   () => db.user.findUniqueOrThrow({ where: { id } }),
 *   'user'
 * );
 * ```
 */
export async function dbQuery<T>(operation: () => Promise<T>, context?: string): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case 'P2002':
          throw new Error(`Duplicate entry: ${context ?? 'record'} already exists`);
        case 'P2025':
          throw new Error(`Not found: ${context ?? 'record'} does not exist`);
        case 'P2003':
          throw new Error(`Invalid reference: related ${context ?? 'record'} not found`);
        default:
          throw new Error(`Database error (${error.code}): ${context ?? 'operation'} failed`);
      }
    }
    throw error;
  }
}
