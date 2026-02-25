import { describe, it, expect } from 'vitest';
import { createApplicationSchema } from '@/validations/applications';

describe('createApplicationSchema', () => {
  const validInput = {
    eventPostingId: '550e8400-e29b-41d4-a716-446655440000',
    coverLetter: 'I am very interested in performing at this event and have relevant experience.',
  };

  it('accepts valid application data', () => {
    const result = createApplicationSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it('rejects invalid UUID for eventPostingId', () => {
    const result = createApplicationSchema.safeParse({
      ...validInput,
      eventPostingId: 'not-a-uuid',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('eventPostingId');
    }
  });

  it('rejects cover letter shorter than 10 characters', () => {
    const result = createApplicationSchema.safeParse({
      ...validInput,
      coverLetter: 'Too short',
    });
    expect(result.success).toBe(false);
  });

  it('rejects cover letter longer than 1000 characters', () => {
    const result = createApplicationSchema.safeParse({
      ...validInput,
      coverLetter: 'A'.repeat(1001),
    });
    expect(result.success).toBe(false);
  });

  it('accepts optional proposedRate', () => {
    const result = createApplicationSchema.safeParse({
      ...validInput,
      proposedRate: 50,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.proposedRate).toBe(50);
    }
  });

  it('rejects negative proposedRate', () => {
    const result = createApplicationSchema.safeParse({
      ...validInput,
      proposedRate: -10,
    });
    expect(result.success).toBe(false);
  });

  it('coerces string proposedRate to number', () => {
    const result = createApplicationSchema.safeParse({
      ...validInput,
      proposedRate: '75',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(typeof result.data.proposedRate).toBe('number');
    }
  });

  it('works without proposedRate (undefined)', () => {
    const result = createApplicationSchema.safeParse(validInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.proposedRate).toBeUndefined();
    }
  });
});
