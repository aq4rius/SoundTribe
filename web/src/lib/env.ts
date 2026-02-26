import { z } from 'zod';

/**
 * Environment variable validation.
 *
 * Import `env` from this module instead of reading `process.env` directly.
 * The app will throw a clear error at startup if any required variable is
 * missing or malformed.
 */

// --- schema ----------------------------------------------------------------

const serverSchema = z.object({
  /** PostgreSQL connection string (Neon). */
  DATABASE_URL: z.string().url(),

  /** NextAuth secret — min 32 characters. */
  AUTH_SECRET: z.string().min(32),

  /** Full canonical URL of the app (e.g. https://soundtribe.vercel.app). */
  NEXTAUTH_URL: z.string().url(),

  /** Cloudinary cloud name. */
  CLOUDINARY_CLOUD_NAME: z.string().min(1).optional(),

  /** Cloudinary API key. */
  CLOUDINARY_API_KEY: z.string().min(1).optional(),

  /** Cloudinary API secret. */
  CLOUDINARY_API_SECRET: z.string().min(1).optional(),

  /** Server-side Ably API key. Required from Phase 4 onward. */
  ABLY_API_KEY: z.string().min(1).optional(),

  /** Node environment — used for conditional logic. */
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

const clientSchema = z.object({
  /**
   * Client-side Ably publishable key. Required from Phase 4 onward.
   * Prefixed with NEXT_PUBLIC_ so it's available in the browser.
   */
  NEXT_PUBLIC_ABLY_KEY: z.string().min(1).optional(),
});

// --- parsing ----------------------------------------------------------------

function parseEnv() {
  const serverResult = serverSchema.safeParse(process.env);
  const clientResult = clientSchema.safeParse({
    NEXT_PUBLIC_ABLY_KEY: process.env.NEXT_PUBLIC_ABLY_KEY,
  });

  if (!serverResult.success) {
    const formatted = serverResult.error.flatten().fieldErrors;
    console.error('❌ Invalid server environment variables:', formatted);
    throw new Error(`Invalid server environment variables:\n${JSON.stringify(formatted, null, 2)}`);
  }

  if (!clientResult.success) {
    const formatted = clientResult.error.flatten().fieldErrors;
    console.error('❌ Invalid client environment variables:', formatted);
    throw new Error(`Invalid client environment variables:\n${JSON.stringify(formatted, null, 2)}`);
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
 * const dbUrl = env.DATABASE_URL;
 * ```
 */
export const env = parseEnv();

export type Env = ReturnType<typeof parseEnv>;
