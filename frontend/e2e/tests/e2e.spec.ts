import { test, expect } from '@playwright/test';

test.describe('Wayzza Premium E2E Smoke Tests', () => {
  test('Landing page renders correctly with premium branding', async ({ page }) => {
    await page.goto('http://localhost:5173/');

    // Ensure the title is correct
    await expect(page).toHaveTitle(/Wayzza/);

    // Ensure the main CTA is present and the copy is the new clear version
    const heroTitle = page.locator('h1').first();
    await expect(heroTitle).toBeVisible();

    // Check that we can navigate to the listings
    const exploreBtn = page.locator('button:has-text("Explore")').first();
    await expect(exploreBtn).toBeVisible({ timeout: 35000 });
    await exploreBtn.click();
    await page.waitForURL((url) => url.pathname.includes('/listings'), { timeout: 35000 });
    await expect(page.locator('input[placeholder="Explore your next destination..."]')).toBeVisible(
      { timeout: 35000 }
    );
  });

  test('Authentication flow renders and accepts input', async ({ page }) => {
    await page.goto('http://localhost:5173/login');

    // Ensure the UI is legible and free of artificial delays
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    await emailInput.fill('test@wayzza.com');
    await passwordInput.fill('SuperSecret123!');

    // Check standard microcopy
    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toContainText(/log in|continue|sign in/i);
  });

  test('Partner network registration renders', async ({ page }) => {
    await page.goto('http://localhost:5173/partner-register');

    // Ensure the partner text is available
    await expect(page.locator('text=Partner Registration')).toBeVisible();

    // Verify inputs
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button:has-text("Stays")')).toBeVisible();
    await expect(page.locator('button:has-text("Vehicles")')).toBeVisible();
  });
});
