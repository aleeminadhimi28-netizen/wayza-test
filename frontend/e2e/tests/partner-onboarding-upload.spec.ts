import { test, expect, type Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE = 'http://localhost:5173';
const API  = 'http://localhost:5000/api/v1';
const TEST_IMAGE_PATH = path.resolve(__dirname, '../test_image.png');

// Base64 for a 1x1 transparent PNG
const BASE64_PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

test.describe('Partner Onboarding with Listing Photo Upload E2E', () => {

  test.beforeAll(async () => {
    // Create a dummy image file
    fs.writeFileSync(TEST_IMAGE_PATH, Buffer.from(BASE64_PNG, 'base64'));
  });

  test.afterAll(async () => {
    // Clean up
    if (fs.existsSync(TEST_IMAGE_PATH)) {
      fs.unlinkSync(TEST_IMAGE_PATH);
    }
  });

  test('Should successfully onboard partner with listing photo upload', async ({ page }) => {
    const partnerEmail = `partner_ob_${Date.now()}@wayza-test.com`;
    const password = 'Test@1234!';
    const businessName = `E2E Photo Prop ${Date.now()}`;

    console.log(`Registering partner: ${partnerEmail}`);

    // 1. Register partner via API
    const regRes = await page.request.post(`${API}/partner/register`, {
      data: {
        businessName,
        email: partnerEmail,
        password,
        phone: '9876543210',
        mainSector: 'stays',
      },
      headers: { 'Content-Type': 'application/json' },
    });
    if (!regRes.ok()) {
      console.error(`Registration failed: ${regRes.status()} ${await regRes.text()}`);
    }
    expect(regRes.ok()).toBe(true);

    // 2. Log in via UI
    await page.goto(`${BASE}/partner-login`);
    await page.fill('#partner-login-email', partnerEmail);
    await page.fill('#partner-login-password', password);
    await page.click('button[type="submit"]');

    // Wait for redirection to onboarding page
    await page.waitForURL(`${BASE}/partner-onboarding`, { timeout: 15000 });
    console.log('Successfully logged in and redirected to onboarding');

    // 3. Step 1: Identity
    // Verify businessName is pre-filled
    await expect(page.locator('input[placeholder="e.g. Azure Cliff Estate"]')).toHaveValue(businessName);
    // Fill MSME number
    await page.fill('input[placeholder="UDYAM-KL-00-0000000"]', 'UDYAM-KL-12-3456789');
    // Continue
    await page.click('button:has-text("Continue")');
    console.log('Completed Step 1');

    // 4. Step 2: Location
    await page.waitForTimeout(1000);
    // Fill location
    await page.fill('input[placeholder="e.g. Varkala Cliff, Kerala"]', 'Varkala Cliff, Kerala');
    // Fill GPS coordinates
    await page.fill('input[placeholder="e.g. 8.7379"]', '8.7379');
    await page.fill('input[placeholder="e.g. 76.7143"]', '76.7143');
    // Continue
    await page.click('button:has-text("Continue")');
    console.log('Completed Step 2');

    // 5. Step 3: Inventory & Image Upload
    await page.waitForTimeout(1000);
    // Fill Listing Name
    await page.fill('input[placeholder="e.g. Oceanfront Cliff Suite"]', 'E2E Deluxe Room');
    // Select Room Type (e.g., Resort / Hotel type pill)
    await page.click('button:has-text("Suite")');
    // Fill Price
    await page.fill('input[placeholder="e.g. 2500"]', '4500');

    // Locate the file input and upload test image
    console.log(`Uploading test image: ${TEST_IMAGE_PATH}`);
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(TEST_IMAGE_PATH);

    // Verify preview is displayed
    const previewImage = page.locator('img[alt="Preview 1"]');
    await expect(previewImage).toBeVisible({ timeout: 10000 });
    console.log('Test image preview is visible');

    // Continue to Step 4
    await page.click('button:has-text("Continue")');
    console.log('Completed Step 3');

    // 6. Step 4: Review & Submit
    await page.waitForTimeout(1000);
    // Verify summary details
    await expect(page.locator('text=1 photo')).toBeVisible();
    await expect(page.locator('text=E2E Deluxe Room')).toBeVisible();
    await expect(page.locator('text=₹4,500')).toBeVisible();

    // Click submit
    await page.click('button:has-text("Submit for Review")');
    console.log('Submitted onboarding');

    // Wait for submission confirmation or redirect
    await page.waitForURL(url => url.pathname.includes('/partner') || page.locator('text=reviewing your business').isVisible(), { timeout: 20000 });
    console.log('Onboarding process completed successfully!');

    // 7. Verify listing in MongoDB via backend script
    console.log('Calling backend script to verify listing images in MongoDB...');
    const backendScriptPath = path.resolve(__dirname, '../../../backend/scripts/verify_listing_images.js');
    const resultJson = execSync(`node "${backendScriptPath}" "${partnerEmail}"`, { encoding: 'utf-8' });
    console.log('Backend verification result:', resultJson);
    const resultObj = JSON.parse(resultJson);
    expect(resultObj.ok).toBe(true);
    expect(resultObj.image).toContain('res.cloudinary.com');
    expect(resultObj.images[0]).toContain('res.cloudinary.com');
    console.log('Database verification passed! Listing has correct image and images.');
  });
});

