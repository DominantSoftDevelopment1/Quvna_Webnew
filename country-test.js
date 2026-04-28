const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();
  
  console.log('=== TEST 1: Page Load ===');
  console.log('Navigating to http://localhost:3000/profile/edit/country');
  await page.goto('http://localhost:3000/profile/edit/country', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  
  // Take initial screenshot
  await page.screenshot({ path: 'country-test.png', fullPage: true });
  console.log('Screenshot saved: country-test.png');
  
  // Check page heading
  const heading = await page.locator('h1, h2').first().textContent().catch(() => 'No heading found');
  console.log('Page heading:', heading.trim());
  
  // Count country items
  const countryItems = await page.locator('button').count();
  console.log('Country buttons found:', countryItems);
  
  console.log('\n=== TEST 2: Search Functionality ===');
  const searchInput = await page.locator('input').first();
  const hasSearch = await searchInput.isVisible().catch(() => false);
  console.log('Search input visible:', hasSearch);
  
  if (hasSearch) {
    // Test search with "Uzbekistan"
    await searchInput.fill('Uzbekistan');
    await page.waitForTimeout(1000);
    
    const filteredItems = await page.locator('button').count();
    console.log('Items after search "Uzbekistan":', filteredItems);
    
    const filteredTexts = await page.locator('button').allTextContents();
    console.log('Filtered results:', filteredTexts.map(b => b.trim()).filter(b => b));
    
    // Clear search
    await searchInput.fill('');
    await page.waitForTimeout(500);
    const afterClear = await page.locator('button').count();
    console.log('Items after clearing search:', afterClear);
    
    // Test search with "Japan"
    await searchInput.fill('Japan');
    await page.waitForTimeout(1000);
    const japanItems = await page.locator('button').allTextContents();
    console.log('Search "Japan" results:', japanItems.map(b => b.trim()).filter(b => b));
    
    await searchInput.fill('');
    await page.waitForTimeout(500);
  }
  
  console.log('\n=== TEST 3: Click Country Item ===');
  const uzbekistanBtn = await page.locator('button:has-text("Uzbekistan")').first();
  const hasUzbekistan = await uzbekistanBtn.isVisible().catch(() => false);
  console.log('Uzbekistan button visible:', hasUzbekistan);
  
  if (hasUzbekistan) {
    await uzbekistanBtn.click();
    await page.waitForTimeout(1500);
    console.log('Clicked on Uzbekistan');
    
    // Take screenshot after click
    await page.screenshot({ path: 'country-test-clicked.png', fullPage: true });
    console.log('Screenshot saved: country-test-clicked.png');
    
    // Check if selection state is visible (e.g. checkmark, highlight)
    const selectedCount = await page.locator('[data-selected], .selected, [aria-selected="true"]').count();
    console.log('Selected elements count:', selectedCount);
  }
  
  console.log('\n=== TEST 4: Save Button ===');
  // Look for save/confirm button
  const saveBtn = await page.locator('button:has-text("Saqlash"), button:has-text("Save"), button:has-text("Tasdiqlash"), button:has-text("Confirm"), [type="submit"]').first();
  const hasSave = await saveBtn.isVisible().catch(() => false);
  console.log('Save button visible:', hasSave);
  
  if (hasSave) {
    console.log('Save button text:', await saveBtn.textContent());
    // Don't actually click save to avoid changing data
  }
  
  console.log('\n=== TEST 5: Check for visual issues ===');
  // Check page for console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  console.log('Console errors:', consoleErrors.length > 0 ? consoleErrors : 'None');
  
  // Check for broken images
  const images = await page.locator('img').all();
  let brokenImages = 0;
  for (const img of images) {
    const naturalWidth = await img.evaluate(el => el.naturalWidth);
    if (naturalWidth === 0) brokenImages++;
  }
  console.log('Broken images:', brokenImages);
  
  // Check layout - any overlapping elements
  const pageHeight = await page.evaluate(() => document.body.scrollHeight);
  console.log('Page scroll height:', pageHeight);
  
  await browser.close();
  console.log('\n=== TEST COMPLETE ===');
})();
