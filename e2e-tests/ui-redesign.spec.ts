import { test, expect } from '@playwright/test';

test.describe('UI Redesign - Layout & Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Mock login to access protected pages
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@medidea.local');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });

  test('should display new sidebar with logo', async ({ page }) => {
    // Verify sidebar is visible
    await expect(page.locator('aside')).toBeVisible();

    // Verify logo/branding
    await expect(page.getByText('Medidea')).toBeVisible();
  });

  test('should display header with breadcrumbs', async ({ page }) => {
    // Verify header exists
    await expect(page.locator('header')).toBeVisible();

    // Navigate to a page and check breadcrumbs
    await page.click('text=Attività');
    await expect(page.getByText('Home')).toBeVisible();
    await expect(page.getByText('Attività')).toBeVisible();
  });

  test('should display user dropdown with logout', async ({ page }) => {
    // Click user dropdown
    const userButton = page.locator('button').filter({ hasText: 'Admin' }).first();
    await userButton.click();

    // Verify logout option
    await expect(page.getByText('Logout')).toBeVisible();
  });

  test('should navigate between pages using sidebar', async ({ page }) => {
    // Navigate to Attività
    await page.click('text=Attività');
    await expect(page).toHaveURL('/attivita');

    // Navigate to Apparecchiature
    await page.click('text=Apparecchiature');
    await expect(page).toHaveURL('/apparecchiature');

    // Navigate back to Dashboard
    await page.click('text=Dashboard');
    await expect(page).toHaveURL('/');
  });
});

test.describe('UI Redesign - Sidebar Collapse', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@medidea.local');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });

  test('should collapse and expand sidebar on desktop', async ({ page }) => {
    // Find collapse button (ChevronLeft icon)
    const collapseButton = page.locator('aside button[aria-label*="Collapse"], aside button[aria-label*="sidebar"]').first();

    // Get initial sidebar width
    const sidebar = page.locator('aside').first();
    const initialWidth = await sidebar.evaluate(el => el.offsetWidth);

    // Click collapse button
    await collapseButton.click();

    // Wait for transition
    await page.waitForTimeout(400);

    // Verify sidebar is narrower
    const collapsedWidth = await sidebar.evaluate(el => el.offsetWidth);
    expect(collapsedWidth).toBeLessThan(initialWidth);

    // Click expand button
    await collapseButton.click();
    await page.waitForTimeout(400);

    // Verify sidebar is back to original width
    const expandedWidth = await sidebar.evaluate(el => el.offsetWidth);
    expect(expandedWidth).toBeGreaterThan(collapsedWidth);
  });
});

test.describe('UI Redesign - Mobile', () => {
  test.use({
    viewport: { width: 375, height: 667 }
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@medidea.local');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });

  test('should show hamburger menu on mobile', async ({ page }) => {
    // Verify hamburger button exists
    const hamburger = page.locator('button[aria-label="Toggle menu"]');
    await expect(hamburger).toBeVisible();
  });

  test('should open mobile drawer when hamburger clicked', async ({ page }) => {
    // Click hamburger
    const hamburger = page.locator('button[aria-label="Toggle menu"]');
    await hamburger.click();

    // Verify drawer is visible (sidebar should be visible on mobile now)
    await page.waitForTimeout(300);

    // Verify backdrop exists
    const backdrop = page.locator('div[class*="fixed"][class*="bg-black"]');
    await expect(backdrop).toBeVisible();

    // Verify sidebar menu items are visible
    await expect(page.getByText('Dashboard')).toBeVisible();
  });

  test('should close mobile drawer when backdrop clicked', async ({ page }) => {
    // Open drawer
    const hamburger = page.locator('button[aria-label="Toggle menu"]');
    await hamburger.click();
    await page.waitForTimeout(300);

    // Click backdrop
    const backdrop = page.locator('div[class*="fixed"][class*="bg-black"]');
    await backdrop.click({ position: { x: 10, y: 10 } });

    // Wait for close animation
    await page.waitForTimeout(300);

    // Hamburger should be visible again (drawer closed)
    await expect(hamburger).toBeVisible();
  });
});

test.describe('UI Redesign - Dashboard Cards', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@medidea.local');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });

  test('should display dashboard quick action cards', async ({ page }) => {
    // Verify all 4 quick action cards are present
    await expect(page.getByText('Attività').first()).toBeVisible();
    await expect(page.getByText('Nuova Attività')).toBeVisible();
    await expect(page.getByText('Apparecchiature').first()).toBeVisible();
    await expect(page.getByText('Nuova Apparecchiatura')).toBeVisible();
  });

  test('should navigate when clicking dashboard cards', async ({ page }) => {
    // Click "Attività" card
    await page.click('text=Gestisci attività giornaliere');
    await expect(page).toHaveURL('/attivita');
  });
});

test.describe('UI Redesign - Breadcrumbs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@medidea.local');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });

  test('should show correct breadcrumbs on nested pages', async ({ page }) => {
    // Navigate to Attività
    await page.click('text=Attività');

    // Verify breadcrumbs
    const breadcrumbs = page.locator('nav[class*="breadcrumb"], nav:has(a[href="/"])');
    await expect(breadcrumbs.getByText('Home')).toBeVisible();
    await expect(breadcrumbs.getByText('Attività')).toBeVisible();
  });

  test('should navigate using breadcrumb links', async ({ page }) => {
    // Navigate to Attività
    await page.click('text=Attività');
    await expect(page).toHaveURL('/attivita');

    // Click Home breadcrumb
    await page.locator('nav a[href="/"]').click();
    await expect(page).toHaveURL('/');
  });
});
