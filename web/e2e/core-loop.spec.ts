import { test, expect } from '@playwright/test';

/**
 * Core loop E2E tests.
 *
 * These tests verify the public browse pages render correctly
 * without authentication. They do NOT require seeded data — they
 * test that the pages load, display correct headings, and handle
 * empty states gracefully.
 */

test.describe('Browse pages', () => {
  test('events page loads and shows heading', async ({ page }) => {
    await page.goto('/events');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('artists page loads and shows heading', async ({ page }) => {
    await page.goto('/artists');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('home page loads with SoundTribe branding', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=SoundTribe')).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test('navbar contains links to artists and events', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: /artists/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /events/i })).toBeVisible();
  });

  test('clicking artists link navigates to artists page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /artists/i }).click();
    await expect(page).toHaveURL(/\/artists/);
  });

  test('clicking events link navigates to events page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /events/i }).click();
    await expect(page).toHaveURL(/\/events/);
  });
});
