import { type Page } from '@playwright/test';

/**
 * Shared E2E test helpers.
 *
 * These helpers encapsulate common navigation and form-fill operations
 * so individual test files stay concise and declarative.
 */

/** Navigate to the login page and fill credentials. */
export async function login(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole('button', { name: /log\s*in|sign\s*in/i }).click();
}

/**
 * Navigate to the registration page and fill the form.
 * Does NOT submit — call `page.getByRole('button', { name: /register|sign up/i }).click()`
 * after calling this if you want to submit.
 */
export async function fillRegistrationForm(
  page: Page,
  data: {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
  },
) {
  await page.goto('/register');
  await page.getByLabel(/username/i).fill(data.username);
  await page.getByLabel(/email/i).fill(data.email);

  // Password fields — match by label text more precisely
  const passwordFields = page.locator('input[type="password"]');
  await passwordFields.nth(0).fill(data.password);
  await passwordFields.nth(1).fill(data.confirmPassword);
}

/** Wait for the page to navigate away from the current URL. */
export async function waitForNavigation(page: Page, urlPattern: string | RegExp) {
  await page.waitForURL(urlPattern, { timeout: 10_000 });
}
