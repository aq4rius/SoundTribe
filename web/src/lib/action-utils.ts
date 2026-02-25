import { auth } from '@/lib/auth';
import type { UserRole } from '@prisma/client';
import type { ActionResult } from '@/types/actions';
import type { Session } from 'next-auth';

/** Session with a guaranteed user.id string. */
export interface AuthenticatedSession extends Session {
  user: Session['user'] & { id: string };
}

/**
 * Gets the current session or returns a typed error.
 * Use at the top of every protected Server Action.
 */
export async function requireAuth(): Promise<
  { session: AuthenticatedSession } | { error: string }
> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'You must be logged in' };
  }
  return { session: session as AuthenticatedSession };
}

/**
 * Checks if the current user has at least one of the required roles.
 */
export function hasRole(
  userRoles: UserRole[],
  required: UserRole | UserRole[],
): boolean {
  const requiredRoles = Array.isArray(required) ? required : [required];
  return requiredRoles.some((role) => userRoles.includes(role));
}

/**
 * Wraps a Server Action with standard error handling.
 * Converts thrown errors into ActionResult failure objects.
 */
export async function withActionHandler<T>(
  fn: () => Promise<T>,
): Promise<ActionResult<T>> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'An unexpected error occurred' };
  }
}
