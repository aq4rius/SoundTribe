import { describe, it, expect, vi } from 'vitest';

// Mock the auth module to avoid importing next-auth/next/server at test time
vi.mock('@/lib/auth', () => ({ auth: vi.fn() }));

import { hasRole, withActionHandler } from '@/lib/action-utils';

// hasRole doesn't need Prisma runtime — it operates on plain string arrays.
// We cast string arrays to the expected UserRole[] type for testing.

describe('hasRole', () => {
  it('returns true when user has the required role', () => {
    const userRoles = ['organizer', 'artist'] as never[];
    expect(hasRole(userRoles, 'artist' as never)).toBe(true);
  });

  it('returns false when user lacks the required role', () => {
    const userRoles = ['artist'] as never[];
    expect(hasRole(userRoles, 'organizer' as never)).toBe(false);
  });

  it('returns true when user has any of multiple required roles', () => {
    const userRoles = ['artist'] as never[];
    expect(hasRole(userRoles, ['organizer', 'artist'] as never[])).toBe(true);
  });

  it('returns false when user has none of multiple required roles', () => {
    const userRoles = ['fan'] as never[];
    expect(hasRole(userRoles, ['organizer', 'artist'] as never[])).toBe(false);
  });

  it('handles empty user roles', () => {
    expect(hasRole([] as never[], 'artist' as never)).toBe(false);
  });

  it('handles empty required roles array', () => {
    const userRoles = ['artist'] as never[];
    expect(hasRole(userRoles, [] as never[])).toBe(false);
  });
});

describe('withActionHandler', () => {
  it('returns success result on successful execution', async () => {
    const result = await withActionHandler(async () => 'hello');
    expect(result).toEqual({ success: true, data: 'hello' });
  });

  it('returns failure result when function throws Error', async () => {
    const result = await withActionHandler(async () => {
      throw new Error('Something failed');
    });
    expect(result).toEqual({ success: false, error: 'Something failed' });
  });

  it('returns generic error for non-Error throws', async () => {
    const result = await withActionHandler(async () => {
      throw 'string error';
    });
    expect(result).toEqual({ success: false, error: 'An unexpected error occurred' });
  });

  it('handles void return type', async () => {
    const result = await withActionHandler(async () => {});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBeUndefined();
    }
  });

  it('handles complex return types', async () => {
    const data = { id: '123', items: [1, 2, 3] };
    const result = await withActionHandler(async () => data);
    expect(result).toEqual({ success: true, data });
  });
});
