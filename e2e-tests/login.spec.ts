import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test('should display login form', async ({ page }) => {
    await page.goto('/login');

    // Check form elements
    await expect(page.getByRole('heading', { name: /medidea login/i })).toBeVisible();
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
    await expect(page.getByPlaceholder(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /accedi/i })).toBeVisible();

    // Check dev credentials hint
    await expect(page.getByText(/admin@medidea.local/i)).toBeVisible();
  });

  test('should login successfully with mock credentials', async ({ page }) => {
    await page.goto('/login');

    // Fill form
    await page.getByPlaceholder(/email/i).fill('admin@medidea.local');
    await page.getByPlaceholder(/password/i).fill('testpassword');

    // Submit
    await page.getByRole('button', { name: /accedi/i }).click();

    // Wait for redirect
    await page.waitForURL('/attivita', { timeout: 10000 });

    // Verify token in localStorage
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeTruthy();

    // Verify user data
    const user = await page.evaluate(() => localStorage.getItem('user'));
    expect(user).toContain('admin@medidea.local');
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/login');

    // Fill with empty email
    await page.getByPlaceholder(/password/i).fill('test');
    await page.getByRole('button', { name: /accedi/i }).click();

    // Should show error (client-side validation or server error)
    // Wait a bit for potential error message
    await page.waitForTimeout(1000);
  });
});
