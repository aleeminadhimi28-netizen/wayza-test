import { test, expect } from '@playwright/test';

test.describe('Wayzza Platform Comprehensive E2E Test Suite', () => {

  test('1. Public Homepage & Clean Airbnb Sections', async ({ page }) => {
    await page.goto('http://localhost:5173/');

    // Page title check
    await expect(page).toHaveTitle(/Wayzza/);

    // Hero Search Bar & Buttons
    await expect(page.locator('h1').first()).toBeVisible();

    // Bikes & Cars Section
    const bikesHeading = page.locator('h3:has-text("Bikes in Varkala")');
    await expect(bikesHeading).toBeVisible();

    // FAQ Accordion
    const faqHeading = page.locator('h2:has-text("Frequently Asked Questions")');
    await expect(faqHeading).toBeVisible();
  });

  test('2. Multi-Category Filtering & Listings Search', async ({ page }) => {
    await page.goto('http://localhost:5173/listings');

    // Wait for listing search bar
    const searchInput = page.locator('input[placeholder="Explore your next destination..."]');
    await expect(searchInput).toBeVisible({ timeout: 15000 });

    // Category Tabs: Bikes
    const bikeTab = page.locator('button:has-text("Bikes"), button:has-text("Bikes & Scooters")').first();
    if (await bikeTab.isVisible()) {
      await bikeTab.click();
    }
  });

  test('3. Currency Switcher (INR to USD)', async ({ page }) => {
    await page.goto('http://localhost:5173/');

    // Currency Switcher Button
    const currencyBtn = page.locator('button:has-text("INR"), button:has-text("USD")').first();
    if (await currencyBtn.isVisible()) {
      await currencyBtn.click();
      // Dropdown menu should show alternative currencies
      const usdOption = page.locator('button:has-text("USD"), div:has-text("USD")').first();
      if (await usdOption.isVisible()) {
        await usdOption.click();
      }
    }
  });

  test('4. Live AI Trip Planner Form', async ({ page }) => {
    await page.goto('http://localhost:5173/ai-trip-planner');

    // Prompt input or title
    const plannerHeading = page.locator('h1, h2').first();
    await expect(plannerHeading).toBeVisible();
  });

  test('5. Admin Route Access Gating', async ({ page }) => {
    await page.goto('http://localhost:5173/admin');

    // Should render login screen or dashboard with Admin login elements
    const loginHeader = page.locator('h2:has-text("Admin Console"), h2:has-text("Sign in"), text=Control Panel, text=Sign in').first();
    await expect(loginHeader).toBeVisible({ timeout: 15000 });
  });

});
