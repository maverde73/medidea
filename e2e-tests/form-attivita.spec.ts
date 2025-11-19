import { test, expect } from '@playwright/test';

test.describe('Form Creazione Attività', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByPlaceholder(/email/i).fill('admin@medidea.local');
    await page.getByPlaceholder(/password/i).fill('test');
    await page.getByRole('button', { name: /accedi/i }).click();
    await page.waitForURL('/attivita');
  });

  test('should display new attivita form', async ({ page }) => {
    await page.goto('/attivita/new');

    // Check form heading
    await expect(page.getByRole('heading', { name: /nuova attività giornaliera/i })).toBeVisible();

    // Check description
    await expect(page.getByText(/compila il form/i)).toBeVisible();

    // Check sections
    await expect(page.getByRole('heading', { name: /dati cliente/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /dati apparecchiatura/i })).toBeVisible();

    // Check submit button
    await expect(page.getByRole('button', { name: /crea attività/i })).toBeVisible();

    // Check cancel button
    await expect(page.getByRole('button', { name: /annulla/i })).toBeVisible();
  });

  test('should have working back button', async ({ page }) => {
    await page.goto('/attivita/new');

    const backButton = page.getByRole('button', { name: /torna indietro/i });
    await backButton.click();

    // Should go back to attivita list
    await expect(page).toHaveURL('/attivita');
  });

  test('should have working cancel button', async ({ page }) => {
    await page.goto('/attivita/new');

    const cancelButton = page.getByRole('button', { name: /annulla/i });
    await cancelButton.click();

    // Should go back
    await expect(page).toHaveURL('/attivita');
  });

  test('should show validation errors on empty submit', async ({ page }) => {
    await page.goto('/attivita/new');

    // Try to submit without filling required fields
    const submitButton = page.getByRole('button', { name: /crea attività/i });
    await submitButton.click();

    // Should show validation error for cliente (required field)
    await page.waitForTimeout(500);

    // Check if error message appears
    const errorText = page.getByText(/obbligatorio/i);
    const errorCount = await errorText.count();

    expect(errorCount).toBeGreaterThan(0);
  });

  test('form fields should be properly labeled', async ({ page }) => {
    await page.goto('/attivita/new');

    // Check for proper labels/accessibility
    await expect(page.getByText(/cliente/i).first()).toBeVisible();

    // Wait for form to fully load
    await page.waitForTimeout(1000);
  });
});
