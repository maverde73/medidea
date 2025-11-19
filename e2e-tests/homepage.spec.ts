import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should display Medidea title and navigation buttons', async ({ page }) => {
    await page.goto('/');

    // Check title
    await expect(page.locator('h1')).toContainText('Medidea');

    // Check description
    await expect(page.getByText('Sistema di gestione attività giornaliere e apparecchiature')).toBeVisible();

    // Check navigation cards
    await expect(page.getByRole('heading', { name: 'Gestione Attività' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Gestione Apparecchiature' })).toBeVisible();

    // Check buttons
    const attivitaButton = page.getByRole('button', { name: /vai alle attività/i });
    const apparecchiatureButton = page.getByRole('button', { name: /vai alle apparecchiature/i });

    await expect(attivitaButton).toBeVisible();
    await expect(apparecchiatureButton).toBeVisible();
  });

  test('should navigate to attivita page when clicking button', async ({ page }) => {
    await page.goto('/');

    const attivitaButton = page.getByRole('button', { name: /vai alle attività/i });
    await attivitaButton.click();

    // Wait for navigation
    await page.waitForURL('/attivita');

    // Verify we're on attivita page
    await expect(page).toHaveURL('/attivita');
    await expect(page.getByRole('heading', { name: /gestione attività/i })).toBeVisible();
  });

  test('should navigate to apparecchiature page when clicking button', async ({ page }) => {
    await page.goto('/');

    const apparecchiatureButton = page.getByRole('button', { name: /vai alle apparecchiature/i });
    await apparecchiatureButton.click();

    // Wait for navigation
    await page.waitForURL('/apparecchiature');

    // Verify we're on apparecchiature page
    await expect(page).toHaveURL('/apparecchiature');
    await expect(page.getByRole('heading', { name: /gestione apparecchiature/i })).toBeVisible();
  });
});
