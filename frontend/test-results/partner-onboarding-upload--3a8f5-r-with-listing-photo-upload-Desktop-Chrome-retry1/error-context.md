# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: partner-onboarding-upload.spec.ts >> Partner Onboarding with Listing Photo Upload E2E >> Should successfully onboard partner with listing photo upload
- Location: e2e\tests\partner-onboarding-upload.spec.ts:31:3

# Error details

```
Test timeout of 120000ms exceeded.
```

```
Error: page.fill: Test timeout of 120000ms exceeded.
Call log:
  - waiting for locator('#email')

```

# Test source

```ts
  1   | import { test, expect, type Page } from '@playwright/test';
  2   | import * as fs from 'fs';
  3   | import * as path from 'path';
  4   | import { execSync } from 'child_process';
  5   | import { fileURLToPath } from 'url';
  6   | 
  7   | const __filename = fileURLToPath(import.meta.url);
  8   | const __dirname = path.dirname(__filename);
  9   | 
  10  | const BASE = 'http://localhost:5173';
  11  | const API  = 'http://localhost:5000/api/v1';
  12  | const TEST_IMAGE_PATH = path.resolve(__dirname, '../test_image.png');
  13  | 
  14  | // Base64 for a 1x1 transparent PNG
  15  | const BASE64_PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
  16  | 
  17  | test.describe('Partner Onboarding with Listing Photo Upload E2E', () => {
  18  | 
  19  |   test.beforeAll(async () => {
  20  |     // Create a dummy image file
  21  |     fs.writeFileSync(TEST_IMAGE_PATH, Buffer.from(BASE64_PNG, 'base64'));
  22  |   });
  23  | 
  24  |   test.afterAll(async () => {
  25  |     // Clean up
  26  |     if (fs.existsSync(TEST_IMAGE_PATH)) {
  27  |       fs.unlinkSync(TEST_IMAGE_PATH);
  28  |     }
  29  |   });
  30  | 
  31  |   test('Should successfully onboard partner with listing photo upload', async ({ page }) => {
  32  |     const partnerEmail = `partner_ob_${Date.now()}@wayza-test.com`;
  33  |     const password = 'Test@1234!';
  34  |     const businessName = `E2E Photo Prop ${Date.now()}`;
  35  | 
  36  |     console.log(`Registering partner: ${partnerEmail}`);
  37  | 
  38  |     // 1. Register partner via API
  39  |     const regRes = await page.request.post(`${API}/partner/register`, {
  40  |       data: {
  41  |         businessName,
  42  |         email: partnerEmail,
  43  |         password,
  44  |         phone: '9876543210',
  45  |         mainSector: 'stays',
  46  |       },
  47  |       headers: { 'Content-Type': 'application/json' },
  48  |     });
  49  |     if (!regRes.ok()) {
  50  |       console.error(`Registration failed: ${regRes.status()} ${await regRes.text()}`);
  51  |     }
  52  |     expect(regRes.ok()).toBe(true);
  53  | 
  54  |     // 2. Log in via UI
  55  |     await page.goto(`${BASE}/partner-login`);
> 56  |     await page.fill('#email', partnerEmail);
      |                ^ Error: page.fill: Test timeout of 120000ms exceeded.
  57  |     await page.fill('#password', password);
  58  |     await page.click('button[type="submit"]');
  59  | 
  60  |     // Wait for redirection to onboarding page
  61  |     await page.waitForURL(`${BASE}/partner-onboarding`, { timeout: 15000 });
  62  |     console.log('Successfully logged in and redirected to onboarding');
  63  | 
  64  |     // 3. Step 1: Identity
  65  |     // Verify businessName is pre-filled
  66  |     await expect(page.locator('input[placeholder="e.g. Azure Cliff Estate"]')).toHaveValue(businessName);
  67  |     // Fill MSME number
  68  |     await page.fill('input[placeholder="UDYAM-KL-00-0000000"]', 'UDYAM-KL-12-3456789');
  69  |     // Continue
  70  |     await page.click('button:has-text("Continue")');
  71  |     console.log('Completed Step 1');
  72  | 
  73  |     // 4. Step 2: Location
  74  |     await page.waitForTimeout(1000);
  75  |     // Fill location
  76  |     await page.fill('input[placeholder="e.g. Varkala Cliff, Kerala"]', 'Varkala Cliff, Kerala');
  77  |     // Fill GPS coordinates
  78  |     await page.fill('input[placeholder="e.g. 8.7379"]', '8.7379');
  79  |     await page.fill('input[placeholder="e.g. 76.7143"]', '76.7143');
  80  |     // Continue
  81  |     await page.click('button:has-text("Continue")');
  82  |     console.log('Completed Step 2');
  83  | 
  84  |     // 5. Step 3: Inventory & Image Upload
  85  |     await page.waitForTimeout(1000);
  86  |     // Fill Listing Name
  87  |     await page.fill('input[placeholder="e.g. Oceanfront Cliff Suite"]', 'E2E Deluxe Room');
  88  |     // Select Room Type (e.g., Resort / Hotel type pill)
  89  |     await page.click('button:has-text("Suite")');
  90  |     // Fill Price
  91  |     await page.fill('input[placeholder="e.g. 2500"]', '4500');
  92  | 
  93  |     // Locate the file input and upload test image
  94  |     console.log(`Uploading test image: ${TEST_IMAGE_PATH}`);
  95  |     const fileInput = page.locator('input[type="file"]');
  96  |     await fileInput.setInputFiles(TEST_IMAGE_PATH);
  97  | 
  98  |     // Verify preview is displayed
  99  |     const previewImage = page.locator('img[alt="Preview 1"]');
  100 |     await expect(previewImage).toBeVisible({ timeout: 10000 });
  101 |     console.log('Test image preview is visible');
  102 | 
  103 |     // Continue to Step 4
  104 |     await page.click('button:has-text("Continue")');
  105 |     console.log('Completed Step 3');
  106 | 
  107 |     // 6. Step 4: Review & Submit
  108 |     await page.waitForTimeout(1000);
  109 |     // Verify summary details
  110 |     await expect(page.locator('text=1 photo')).toBeVisible();
  111 |     await expect(page.locator('text=E2E Deluxe Room')).toBeVisible();
  112 |     await expect(page.locator('text=₹4,500')).toBeVisible();
  113 | 
  114 |     // Click submit
  115 |     await page.click('button:has-text("Submit for Review")');
  116 |     console.log('Submitted onboarding');
  117 | 
  118 |     // Wait for submission confirmation or redirect
  119 |     await page.waitForURL(url => url.pathname.includes('/partner') || page.locator('text=reviewing your business').isVisible(), { timeout: 20000 });
  120 |     console.log('Onboarding process completed successfully!');
  121 | 
  122 |     // 7. Verify listing in MongoDB via backend script
  123 |     console.log('Calling backend script to verify listing images in MongoDB...');
  124 |     const backendScriptPath = path.resolve(__dirname, '../../../backend/scripts/verify_listing_images.js');
  125 |     const resultJson = execSync(`node "${backendScriptPath}" "${partnerEmail}"`, { encoding: 'utf-8' });
  126 |     console.log('Backend verification result:', resultJson);
  127 |     const resultObj = JSON.parse(resultJson);
  128 |     expect(resultObj.ok).toBe(true);
  129 |     expect(resultObj.image).toContain('res.cloudinary.com');
  130 |     expect(resultObj.images[0]).toContain('res.cloudinary.com');
  131 |     console.log('Database verification passed! Listing has correct image and images.');
  132 |   });
  133 | });
  134 | 
  135 | 
```