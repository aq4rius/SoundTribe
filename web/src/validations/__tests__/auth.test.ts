import { describe, it, expect } from 'vitest';
import { loginSchema, registerSchema, changePasswordSchema } from '@/validations/auth';

describe('loginSchema', () => {
  it('accepts valid credentials', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'secret123',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'secret123',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('email');
    }
  });

  it('rejects empty password', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: '',
    });
    expect(result.success).toBe(false);
  });
});

describe('registerSchema', () => {
  const validInput = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'Password1',
    confirmPassword: 'Password1',
  };

  it('accepts valid registration data', () => {
    const result = registerSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it('rejects username shorter than 3 characters', () => {
    const result = registerSchema.safeParse({ ...validInput, username: 'ab' });
    expect(result.success).toBe(false);
  });

  it('rejects username longer than 30 characters', () => {
    const result = registerSchema.safeParse({ ...validInput, username: 'a'.repeat(31) });
    expect(result.success).toBe(false);
  });

  it('rejects username with special characters', () => {
    const result = registerSchema.safeParse({ ...validInput, username: 'user@name!' });
    expect(result.success).toBe(false);
  });

  it('allows underscores in username', () => {
    const result = registerSchema.safeParse({ ...validInput, username: 'test_user_123' });
    expect(result.success).toBe(true);
  });

  it('rejects password without uppercase letter', () => {
    const result = registerSchema.safeParse({
      ...validInput,
      password: 'password1',
      confirmPassword: 'password1',
    });
    expect(result.success).toBe(false);
  });

  it('rejects password without number', () => {
    const result = registerSchema.safeParse({
      ...validInput,
      password: 'Password',
      confirmPassword: 'Password',
    });
    expect(result.success).toBe(false);
  });

  it('rejects password shorter than 8 characters', () => {
    const result = registerSchema.safeParse({
      ...validInput,
      password: 'Pass1',
      confirmPassword: 'Pass1',
    });
    expect(result.success).toBe(false);
  });

  it('rejects mismatched passwords', () => {
    const result = registerSchema.safeParse({
      ...validInput,
      confirmPassword: 'DifferentPassword1',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('confirmPassword');
    }
  });
});

describe('changePasswordSchema', () => {
  const validInput = {
    currentPassword: 'OldPassword1',
    newPassword: 'NewPassword1',
    confirmNewPassword: 'NewPassword1',
  };

  it('accepts valid change password data', () => {
    const result = changePasswordSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it('rejects empty current password', () => {
    const result = changePasswordSchema.safeParse({ ...validInput, currentPassword: '' });
    expect(result.success).toBe(false);
  });

  it('rejects new password without uppercase', () => {
    const result = changePasswordSchema.safeParse({
      ...validInput,
      newPassword: 'password1',
      confirmNewPassword: 'password1',
    });
    expect(result.success).toBe(false);
  });

  it('rejects mismatched new passwords', () => {
    const result = changePasswordSchema.safeParse({
      ...validInput,
      confirmNewPassword: 'Mismatch1',
    });
    expect(result.success).toBe(false);
  });
});
