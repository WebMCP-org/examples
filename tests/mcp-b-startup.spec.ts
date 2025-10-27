import { expect, test } from '@playwright/test';

test.describe('MCP-B Startup Example', () => {
  test('should load the page', async ({ page }) => {
    await page.goto('http://localhost:5175');

    // Check page loaded
    await expect(page.locator('h1')).toContainText('Vite + TypeScript');
  });

  test('should have navigator.modelContext API available', async ({ page }) => {
    await page.goto('http://localhost:5175');

    // Wait for polyfill to load
    await page.waitForTimeout(500);

    // Check that the API is available
    const hasAPI = await page.evaluate(() => 'modelContext' in navigator);
    expect(hasAPI).toBe(true);
  });

  test('should register counter tools', async ({ page }) => {
    await page.goto('http://localhost:5175');

    // Wait for page to fully load
    await page.waitForTimeout(500);

    // Check that tools are registered
    const toolCount = await page.evaluate(() => {
      const w = window as unknown as { __mcpBridge?: { tools: Map<string, unknown> } };
      if (w.__mcpBridge) {
        return w.__mcpBridge.tools.size;
      }
      return 0;
    });

    // Should have 3 tools: incrementCounter, setCounter, getCounter
    expect(toolCount).toBe(3);
  });

  test('should display initial counter value', async ({ page }) => {
    await page.goto('http://localhost:5175');

    const counter = page.locator('#counter');
    await expect(counter).toContainText('count is 0');
  });

  test('should increment counter on button click', async ({ page }) => {
    await page.goto('http://localhost:5175');

    const counter = page.locator('#counter');

    // Click the counter button
    await counter.click();
    await expect(counter).toContainText('count is 1');

    // Click again
    await counter.click();
    await expect(counter).toContainText('count is 2');
  });
});
