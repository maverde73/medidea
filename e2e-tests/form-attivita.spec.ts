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

  test('should display DDT section in new attivita form', async ({ page }) => {
    await page.goto('/attivita/new');

    // Check DDT section heading
    await expect(page.getByRole('heading', { name: /DDT - Documento Di Trasporto/i })).toBeVisible();

    // Check DDT Cliente subsection
    await expect(page.getByRole('heading', { name: /DDT Cliente \(Ritiro\)/i })).toBeVisible();
    await expect(page.getByLabel(/Numero DDT Cliente/i)).toBeVisible();
    await expect(page.getByLabel(/Data DDT Cliente/i)).toBeVisible();

    // Check DDT Consegna subsection
    await expect(page.getByRole('heading', { name: /DDT Consegna/i })).toBeVisible();
    await expect(page.getByLabel(/Numero DDT Consegna/i)).toBeVisible();
    await expect(page.getByLabel(/Data DDT Consegna/i)).toBeVisible();

    // Check info message
    await expect(page.getByText(/Potrai caricare i file DDT dopo aver salvato/i)).toBeVisible();
  });

  test('DDT fields should be optional', async ({ page }) => {
    await page.goto('/attivita/new');

    // DDT fields should be visible but not required
    await expect(page.getByLabel(/Numero DDT Cliente/i)).toBeVisible();
    await expect(page.getByLabel(/Data DDT Cliente/i)).toBeVisible();
    await expect(page.getByLabel(/Numero DDT Consegna/i)).toBeVisible();
    await expect(page.getByLabel(/Data DDT Consegna/i)).toBeVisible();

    // Try to submit without filling DDT fields (will fail for other reasons but not DDT)
    const submitButton = page.getByRole('button', { name: /crea attività/i });
    await submitButton.click();

    await page.waitForTimeout(500);

    // Should not show DDT-specific validation errors
    await expect(page.getByText(/DDT.*obbligatorio/i)).not.toBeVisible();
  });

  test('should accept DDT date and number formats', async ({ page }) => {
    await page.goto('/attivita/new');

    // Scroll to DDT section
    await page.getByRole('heading', { name: /DDT - Documento Di Trasporto/i }).scrollIntoViewIfNeeded();

    // Fill DDT Cliente fields
    await page.getByLabel(/Numero DDT Cliente/i).fill('DDT-2024-001');
    await page.getByLabel(/Data DDT Cliente/i).fill('2024-01-15');

    // Fill DDT Consegna fields
    await page.getByLabel(/Numero DDT Consegna/i).fill('DDT-2024-002');
    await page.getByLabel(/Data DDT Consegna/i).fill('2024-01-20');

    // Values should be retained
    await expect(page.getByLabel(/Numero DDT Cliente/i)).toHaveValue('DDT-2024-001');
    await expect(page.getByLabel(/Data DDT Cliente/i)).toHaveValue('2024-01-15');
    await expect(page.getByLabel(/Numero DDT Consegna/i)).toHaveValue('DDT-2024-002');
    await expect(page.getByLabel(/Data DDT Consegna/i)).toHaveValue('2024-01-20');
  });
});
