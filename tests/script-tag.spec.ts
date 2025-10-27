import { expect, test } from '@playwright/test';

test.describe('Script Tag Example', () => {
  test('should load the page', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Check page loaded
    await expect(page.locator('h1')).toContainText('MCP-B Script Tag Demo');
    await expect(page.locator('.subtitle')).toContainText('One script tag = AI superpowers');
  });

  test('should have navigator.modelContext API available', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Wait a bit for script to load
    await page.waitForTimeout(1500);

    // Check that the API is available
    const hasAPI = await page.evaluate(() => 'modelContext' in navigator);
    expect(hasAPI).toBe(true);

    // Verify status shows MCP is ready
    await expect(page.locator('#status')).toContainText('MCP Ready');
  });

  test('should register tools successfully', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Wait for tools to be registered
    await page.waitForTimeout(1500);

    // Check that tools are registered
    const toolCount = await page.evaluate(() => {
      const w = window as unknown as { __mcpBridge?: { tools: Map<string, unknown> } };
      if (w.__mcpBridge) {
        return w.__mcpBridge.tools.size;
      }
      return 0;
    });

    // Should have 4 tools: addTodo, getTodos, deleteTodo, calculate
    expect(toolCount).toBe(4);
  });

  test('should render initial todos', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Check that todos are displayed
    const todos = page.locator('#todos .todo');
    await expect(todos).toHaveCount(3);

    await expect(todos.nth(0)).toContainText('Learn MCP-B');
    await expect(todos.nth(1)).toContainText('Chat with AI');
    await expect(todos.nth(2)).toContainText('See it work');
  });

  test('should add a todo via UI', async ({ page }) => {
    await page.goto('http://localhost:5173');

    // Wait for initial todos to render
    await page.waitForTimeout(1500);

    // Add a todo
    await page.fill('#input', 'Test todo');
    await page.click('button:has-text("Add")');

    // Wait for the todo to be added and rendered
    await page.waitForTimeout(500);

    // Check it was added
    const todos = page.locator('#todos .todo');
    await expect(todos).toHaveCount(4);
    await expect(todos.nth(3)).toContainText('Test todo');
  });
});
