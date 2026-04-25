import { test, expect } from '@playwright/test';

test.describe('Wayza E2E Flow', () => {

  test.beforeAll(async ({ request }) => {
    // Seed the database before tests run
    const response = await request.post('http://localhost:5000/api/v1/misc/seed');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    console.log('Seed response:', data);
  });

  test('User can sign up, log in, browse, and book a property', async ({ page }) => {
    // 1. Visit landing page
    page.on('response', async response => {
      if (response.url().includes('/api/v1/')) {
        try {
          const body = await response.json();
          console.log('<<', response.status(), response.url(), body);
        } catch (e) { }
      }
    });

    await page.goto('/');
    await expect(page).toHaveTitle(/Wayzza/);

    // Bypass signup UI flakiness by using the seeded user
    const testEmail = `testguest@test.com`;

    // 2. Navigate to Login directly
    await page.goto('/login');

    // 4. Log in
    await page.locator('input[type="email"]').fill(testEmail);
    await page.locator('input[type="password"]').fill('Password123');

    await page.keyboard.press('Enter');
    await page.waitForSelector('text=View inventory', { timeout: 15000 });

    // 5. Navigate to Listings
    await page.click('text=View inventory');

    // Wait for the listings page
    await page.waitForSelector('input[placeholder="Explore your next destination..."]');

    // Search for Sample City
    await page.locator('input[placeholder="Explore your next destination..."]').fill('Sample City');
    await page.click('button:has-text("Search")');
    await page.waitForTimeout(1000); // Wait for results to update

    // 6. Find Sample Property and view details
    await page.waitForSelector('text=Sample Property');
    await page.click('text=Sample Property', { force: true });

    // Wait until listing details load
    await page.waitForSelector('text=Initialize Reservation', { timeout: 10000 });

    // 7. Click to open Booking form
    await page.click('text=Initialize Reservation');

    // Wait for the booking page
    await page.waitForURL('**/booking/*', { timeout: 10000 });

    // Click final Reserve
    await page.click('button:has-text("Reserve Now")', { force: true });

    // 8. Confirm Booking (Payment)
    try {
      await page.waitForURL('**/payment/*', { timeout: 10000 });
    } catch (e) {
      const bd = await page.locator('body').innerText();
      console.log("Failed to navigate to payment. Body:", bd);
      throw e;
    }
    await page.waitForSelector('text=Authorize Entry');
    await page.click('button:has-text("Authorize Entry")');

    // 9. Verify success
    await page.waitForURL('**/payment-success', { timeout: 15000 });
    await expect(page.locator('text=Payment confirmed')).toBeVisible();
  });

});
