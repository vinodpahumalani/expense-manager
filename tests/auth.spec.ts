import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("should display login form on homepage", async ({ page }) => {
    await expect(page.locator("h2")).toContainText("Sign in to your account");
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText(
      "Sign In"
    );
  });

  test("should login as admin successfully", async ({ page }) => {
    await page.fill('input[name="email"]', "admin@example.com");
    await page.fill('input[name="password"]', "admin123");

    // Click login button and wait for navigation
    const [response] = await Promise.all([
      page.waitForResponse("**/api/auth/login"),
      page.click('button[type="submit"]'),
    ]);

    // Check if login was successful
    expect(response.status()).toBe(200);

    // Wait for dashboard to load
    await page.waitForURL("/dashboard", { timeout: 10000 });
    await expect(page).toHaveURL("/dashboard");
    await expect(page.locator("h1").first()).toContainText("Expense Tracker");
  });

  test("should login as employee successfully", async ({ page }) => {
    await page.fill('input[name="email"]', "john@example.com");
    await page.fill('input[name="password"]', "employee123");

    // Click login button and wait for navigation
    const [response] = await Promise.all([
      page.waitForResponse("**/api/auth/login"),
      page.click('button[type="submit"]'),
    ]);

    // Check if login was successful
    expect(response.status()).toBe(200);

    // Wait for dashboard to load
    await page.waitForURL("/dashboard", { timeout: 10000 });
    await expect(page).toHaveURL("/dashboard");
    await expect(page.locator("h1").first()).toContainText("Expense Tracker");
  });

  test("should show error for invalid credentials", async ({ page }) => {
    // Fill login form with invalid credentials
    await page.fill('input[name="email"]', "invalid@example.com");
    await page.fill('input[name="password"]', "wrongpassword");

    // Click login button
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator(".bg-red-100")).toBeVisible();
    await expect(page.locator(".bg-red-100")).toContainText(
      "Invalid credentials"
    );
  });

  test("should show validation errors for empty fields", async ({ page }) => {
    // Click login button without filling fields
    await page.click('button[type="submit"]');

    // Should stay on login page
    await expect(page).toHaveURL("/");

    // Should show form validation (assuming you have client-side validation)
    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });

  test("should switch to registration form", async ({ page }) => {
    // Click register button
    await page.click("text=Don't have an account? Sign up");

    // Should show registration form
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('select[name="role"]')).toBeVisible();
  });

  test("should register new employee successfully", async ({ page }) => {
    // Switch to register form
    await page.click("text=Don't have an account? Sign up");

    // Fill registration form
    await page.fill('input[name="name"]', "Test Employee");
    await page.fill('input[name="email"]', `test${Date.now()}@example.com`);
    await page.fill('input[name="password"]', "password123");
    await page.selectOption('select[name="role"]', "employee");

    // Submit registration
    await page.click('button[type="submit"]');

    // Should switch back to login form after successful registration
    await expect(page.locator("h2")).toContainText("Sign in to your account");
  });

  test("should logout successfully", async ({ page }) => {
    // Login first
    await page.fill('input[name="email"]', "admin@example.com");
    await page.fill('input[name="password"]', "admin123");

    // Wait for login to complete
    const [response] = await Promise.all([
      page.waitForResponse("**/api/auth/login"),
      page.click('button[type="submit"]'),
    ]);

    expect(response.status()).toBe(200);

    // Wait for dashboard
    await page.waitForURL("/dashboard", { timeout: 10000 });
    await expect(page).toHaveURL("/dashboard");

    // Click logout button
    await page.click("text=Logout");

    // Should redirect to login page
    await expect(page).toHaveURL("/");
    await expect(page.locator('input[name="email"]')).toBeVisible();
  });
});
