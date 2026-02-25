import { test, expect } from '@playwright/test';

/**
 * Auth flow E2E tests.
 *
 * These tests verify the public-facing auth pages render correctly
 * and perform basic client-side validation. They do NOT require a running
 * database — they only test the UI layer.
 */

test.describe('Auth pages', () => {
  test('login page renders with email and password fields', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /log\s*in|sign\s*in/i })).toBeVisible();
  });

  test('register page renders with all required fields', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByLabel(/username/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    // At least two password fields (password + confirm)
    const passwordFields = page.locator('input[type="password"]');
    await expect(passwordFields).toHaveCount(2);
  });

  test('login page shows validation on empty submit', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /log\s*in|sign\s*in/i }).click();
    // Browser-native or custom validation should prevent navigation
    await expect(page).toHaveURL(/\/login/);
  });

  test('navigation between login and register', async ({ page }) => {
    await page.goto('/login');
    // Look for a link to the register page
    const registerLink = page.getByRole('link', { name: /register|sign\s*up|create.*account/i });
    if (await registerLink.isVisible()) {
      await registerLink.click();
      await expect(page).toHaveURL(/\/register/);
    }
  });

  test('unauthenticated user is redirected from dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    // Should be redirected to login (or see an auth wall)
    await expect(page).toHaveURL(/\/(login|auth)/);
  });
});
