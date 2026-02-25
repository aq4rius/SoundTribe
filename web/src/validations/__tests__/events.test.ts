import { describe, it, expect } from 'vitest';
import { createEventSchema, updateEventSchema } from '@/validations/events';

describe('createEventSchema', () => {
  const validInput = {
    title: 'Sunset Music Festival',
    description: 'A wonderful outdoor music festival with many stages and artists.',
    genres: ['jazz', 'classical'],
    requiredInstruments: ['piano'],
    location: 'Austin, TX',
    eventDate: new Date(Date.now() + 86_400_000).toISOString(), // tomorrow
    duration: 120,
    paymentAmount: 500,
    paymentType: 'fixed' as const,
    requiredExperience: 2,
    applicationDeadline: new Date(Date.now() + 43_200_000).toISOString(),
  };

  it('accepts valid input', () => {
    const result = createEventSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it('rejects title shorter than 5 characters', () => {
    const result = createEventSchema.safeParse({ ...validInput, title: 'Hi' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('title');
    }
  });

  it('rejects title longer than 100 characters', () => {
    const result = createEventSchema.safeParse({ ...validInput, title: 'A'.repeat(101) });
    expect(result.success).toBe(false);
  });

  it('rejects description shorter than 20 characters', () => {
    const result = createEventSchema.safeParse({ ...validInput, description: 'Too short' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('description');
    }
  });

  it('requires at least one genre', () => {
    const result = createEventSchema.safeParse({ ...validInput, genres: [] });
    expect(result.success).toBe(false);
  });

  it('requires at least one instrument', () => {
    const result = createEventSchema.safeParse({ ...validInput, requiredInstruments: [] });
    expect(result.success).toBe(false);
  });

  it('rejects empty location', () => {
    const result = createEventSchema.safeParse({ ...validInput, location: '' });
    expect(result.success).toBe(false);
  });

  it('rejects event date in the past', () => {
    const result = createEventSchema.safeParse({
      ...validInput,
      eventDate: new Date('2020-01-01').toISOString(),
    });
    expect(result.success).toBe(false);
  });

  it('rejects negative duration', () => {
    const result = createEventSchema.safeParse({ ...validInput, duration: -1 });
    expect(result.success).toBe(false);
  });

  it('rejects negative payment amount', () => {
    const result = createEventSchema.safeParse({ ...validInput, paymentAmount: -100 });
    expect(result.success).toBe(false);
  });

  it('rejects invalid payment type', () => {
    const result = createEventSchema.safeParse({ ...validInput, paymentType: 'monthly' });
    expect(result.success).toBe(false);
  });

  it('coerces string numbers to numbers', () => {
    const result = createEventSchema.safeParse({
      ...validInput,
      duration: '120',
      paymentAmount: '500',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(typeof result.data.duration).toBe('number');
      expect(typeof result.data.paymentAmount).toBe('number');
    }
  });

  it('defaults requiredExperience to 0', () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { requiredExperience: _, ...rest } = validInput;
    const result = createEventSchema.safeParse(rest);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.requiredExperience).toBe(0);
    }
  });
});

describe('updateEventSchema', () => {
  it('accepts partial input (all fields optional)', () => {
    const result = updateEventSchema.safeParse({ title: 'Updated Title' });
    expect(result.success).toBe(true);
  });

  it('accepts empty object', () => {
    const result = updateEventSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('still validates field constraints when provided', () => {
    const result = updateEventSchema.safeParse({ title: 'Hi' });
    expect(result.success).toBe(false);
  });
});
