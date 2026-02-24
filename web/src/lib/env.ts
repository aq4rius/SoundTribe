import { z } from 'zod';

/**
 * Environment variable validation.
 *
 * Import `env` from this module instead of reading `process.env` directly.
 * The app will throw a clear error at startup if any required variable is
 * missing or malformed.
 *
 * During the migration (Phases 0–3) the Express-era NEXT_PUBLIC_* vars are
 * still required. They will be removed after Phase 4 when the Express server
 * is decommissioned.
 */

// --- schema ----------------------------------------------------------------

const serverSchema = z.object({
  /** PostgreSQL connection string (Neon). Required from Phase 1 onward. */
  DATABASE_URL: z.string().url().optional(),

  /** NextAuth secret — min 32 characters. Required from Phase 1 onward. */
  AUTH_SECRET: z.string().min(32).optional(),

  /** Full canonical URL of the app (e.g. https://soundtribe.vercel.app). */
  NEXTAUTH_URL: z.string().url().optional(),

  /** Cloudinary cloud name. Required from Phase 2 onward. */
  CLOUDINARY_CLOUD_NAME: z.string().min(1).optional(),

  /** Cloudinary API key. Required from Phase 2 onward. */
  CLOUDINARY_API_KEY: z.string().min(1).optional(),

  /** Cloudinary API secret. Required from Phase 2 onward. */
  CLOUDINARY_API_SECRET: z.string().min(1).optional(),

  /** Server-side Ably API key. Required from Phase 4 onward. */
  ABLY_API_KEY: z.string().min(1).optional(),

  /** Node environment — used for conditional logic. */
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
});

const clientSchema = z.object({
  /**
   * Client-side Ably publishable key. Required from Phase 4 onward.
   * Prefixed with NEXT_PUBLIC_ so it's available in the browser.
   */
  NEXT_PUBLIC_ABLY_KEY: z.string().min(1).optional(),

  /**
   * @deprecated Legacy — Express API URL. Remove after Phase 4.
   * Falls back to http://localhost:5000 if not set during migration.
   */
  NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:5000'),

  /**
   * @deprecated Legacy — Socket.IO server URL. Remove after Phase 4.
   * Falls back to http://localhost:5000 if not set during migration.
   */
  NEXT_PUBLIC_SOCKET_URL: z.string().url().default('http://localhost:5000'),
});

// --- parsing ----------------------------------------------------------------

function parseEnv() {
  const serverResult = serverSchema.safeParse(process.env);
  const clientResult = clientSchema.safeParse({
    NEXT_PUBLIC_ABLY_KEY: process.env.NEXT_PUBLIC_ABLY_KEY,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL,
  });

  if (!serverResult.success) {
    const formatted = serverResult.error.flatten().fieldErrors;
    console.error('❌ Invalid server environment variables:', formatted);
    throw new Error(
      `Invalid server environment variables:\n${JSON.stringify(formatted, null, 2)}`,
    );
  }

  if (!clientResult.success) {
    const formatted = clientResult.error.flatten().fieldErrors;
    console.error('❌ Invalid client environment variables:', formatted);
    throw new Error(
      `Invalid client environment variables:\n${JSON.stringify(formatted, null, 2)}`,
    );
  }

  return {
    ...serverResult.data,
    ...clientResult.data,
  };
}

/**
 * Validated environment variables.
 *
 * Usage:
 * ```ts
 * import { env } from '@/lib/env';
 * const url = env.NEXT_PUBLIC_API_URL;
 * ```
 */
export const env = parseEnv();

export type Env = ReturnType<typeof parseEnv>;
