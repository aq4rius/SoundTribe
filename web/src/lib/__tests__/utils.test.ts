import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn (className merge utility)', () => {
  it('merges multiple class strings', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible');
  });

  it('handles undefined and null', () => {
    expect(cn('base', undefined, null, 'end')).toBe('base end');
  });

  it('merges Tailwind classes correctly (twMerge)', () => {
    // twMerge should resolve conflicting utility classes
    expect(cn('px-4', 'px-8')).toBe('px-8');
  });

  it('handles empty input', () => {
    expect(cn()).toBe('');
  });

  it('handles array inputs via clsx', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar');
  });

  it('handles object inputs via clsx', () => {
    expect(cn({ hidden: true, visible: false })).toBe('hidden');
  });
});
