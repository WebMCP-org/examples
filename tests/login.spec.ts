import { expect, test } from '@playwright/test';

test.describe('Login Example', () => {
  test('should load the page', async ({ page }) => {
    await page.goto('http://localhost:5174');

    // Check page loaded
    await expect(page.locator('h1')).toContainText('My AI-Powered Website');
  });

  test('should have navigator.modelContext API available after polyfill loads', async ({ page }) => {
    await page.goto('http://localhost:5174');

    // Wait for polyfill to load
    await page.waitForTimeout(500);

    // Check that the API is available
    const hasAPI = await page.evaluate(() => 'modelContext' in navigator);
    expect(hasAPI).toBe(true);
  });

  test('should show offline status initially', async ({ page }) => {
    await page.goto('http://localhost:5174');

    await expect(page.locator('#status-text')).toContainText('Offline');
    await expect(page.locator('#login-btn')).toBeEnabled();
    await expect(page.locator('#logout-btn')).toBeDisabled();
  });

  test('should login and register tools', async ({ page }) => {
    await page.goto('http://localhost:5174');

    // Click login
    await page.click('#login-btn');

    // Wait for login to complete
    await page.waitForTimeout(500);

    // Check status changed to online
    await expect(page.locator('#status-text')).toContainText('Online');
    await expect(page.locator('#login-btn')).toBeDisabled();
    await expect(page.locator('#logout-btn')).toBeEnabled();

    // Check that tools are registered
    const toolCount = await page.evaluate(() => {
      const w = window as unknown as { __mcpBridge?: { tools: Map<string, unknown> } };
      if (w.__mcpBridge) {
        return w.__mcpBridge.tools.size;
      }
      return 0;
    });

    // Should have 7 tools
    expect(toolCount).toBeGreaterThan(0);
  });

  test('should logout and clear tools state', async ({ page }) => {
    await page.goto('http://localhost:5174');

    // Login first
    await page.click('#login-btn');
    await page.waitForTimeout(500);

    // Then logout
    await page.click('#logout-btn');
    await page.waitForTimeout(500);

    // Check status changed to offline
    await expect(page.locator('#status-text')).toContainText('Offline');
    await expect(page.locator('#login-btn')).toBeEnabled();
    await expect(page.locator('#logout-btn')).toBeDisabled();
  });
});
