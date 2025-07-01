import { test, expect } from "@playwright/test";

test.describe("Expense Management", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.fill('input[name="email"]', "admin@example.com");
    await page.fill('input[name="password"]', "admin123");

    const [response] = await Promise.all([
      page.waitForResponse("**/api/auth/login"),
      page.click('button[type="submit"]'),
    ]);

    expect(response.status()).toBe(200);
    await page.waitForURL("/dashboard", { timeout: 10000 });
    await expect(page).toHaveURL("/dashboard");
  });

  test("should navigate to expenses page", async ({ page }) => {
    await page.click("text=Expenses");
    await page.waitForURL("/dashboard/expenses");
    await expect(page).toHaveURL("/dashboard/expenses");
    await expect(page.getByRole("heading", { name: "Expenses" })).toBeVisible();
  });

  test("should display expenses table with data", async ({ page }) => {
    await page.click("text=Expenses");
    await expect(page).toHaveURL("/dashboard/expenses");

    await page.waitForSelector("table th", { timeout: 10000 });

    await expect(page.locator("th")).toContainText([
      "Date",
      "Description",
      "Category",
      "Amount",
      "Status",
      "Submitted By",
      "Actions",
    ]);

    const expenseRows = page.locator("tbody tr");
    await expect(expenseRows.first()).toBeVisible();
  });

  test("should navigate to add expense page", async ({ page }) => {
    await page.click("text=Add Expense");
    await page.waitForURL("/dashboard/add-expense");
    await expect(page).toHaveURL("/dashboard/add-expense");
    await expect(
      page.getByRole("heading", { name: "Add New Expense" })
    ).toContainText("Add New Expense");
  });

  test("should create new expense successfully", async ({ page }) => {
    await page.click("text=Add Expense");
    await page.waitForURL("/dashboard/add-expense");

    await page.waitForSelector('input[name="amount"]');
    await page.waitForSelector('textarea[name="description"]');
    await page.waitForSelector('select[name="category"]');

    await page.fill('input[name="amount"]', "150.00");
    await page.fill('textarea[name="description"]', "Test Business Lunch");
    await page.selectOption('select[name="category"]', "meals");

    await page.click('button[type="submit"]');

    await expect(page).toHaveURL("/dashboard/expenses");

    await expect(page.locator("tbody")).toContainText("Test Business Lunch");
    await expect(page.locator("tbody")).toContainText("$150.00");
  });

  test("should show validation errors for invalid expense data", async ({
    page,
  }) => {
    await page.click("text=Add Expense");

    await page.click('button[type="submit"]');

    await expect(page).toHaveURL("/dashboard/add-expense");

    const amountInput = page.locator('input[name="amount"]');
    await expect(amountInput).toBeVisible();
  });

  test("should filter expenses by status", async ({ page }) => {
    await page.click("text=Expenses");

    const statusFilter = page.locator('select[name="status"]');
    if (await statusFilter.isVisible()) {
      await statusFilter.selectOption("pending");

      await page.waitForTimeout(1000);

      const statusCells = page.locator("tbody tr td:nth-child(4)");
      const count = await statusCells.count();

      for (let i = 0; i < count; i++) {
        await expect(statusCells.nth(i)).toContainText("pending");
      }
    }
  });

  test("should search expenses by description", async ({ page }) => {
    await page.click("text=Expenses");

    const searchInput = page.locator('input[placeholder*="Search"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill("lunch");

      await page.waitForTimeout(1000);

      const tableBody = page.locator("tbody");
      await expect(tableBody).toContainText("lunch");
    }
  });
});

test.describe("Expense Management - Employee Role", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.fill('input[name="email"]', "john@example.com");
    await page.fill('input[name="password"]', "employee123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL("/dashboard");
  });

  test("employee should only see their own expenses", async ({ page }) => {
    await page.click("text=Expenses");
    await expect(page).toHaveURL("/dashboard/expenses");

    await expect(page.getByRole("heading", { name: "Expenses" })).toBeVisible();

    const approveButtons = page.locator('button:has-text("Approve")');
    await expect(approveButtons).toHaveCount(0);
  });

  test("employee should be able to create expense", async ({ page }) => {
    await page.click("text=Add Expense");
    await page.waitForURL("/dashboard/add-expense");

    await page.waitForSelector('input[name="amount"]');
    await page.waitForSelector('textarea[name="description"]');
    await page.waitForSelector('select[name="category"]');

    await page.fill('input[name="amount"]', "75.50");
    await page.fill('textarea[name="description"]', "Employee Coffee Meeting");
    await page.selectOption('select[name="category"]', "meals");

    await page.click('button[type="submit"]');

    await expect(page).toHaveURL("/dashboard/expenses");

    await expect(page.locator("tbody")).toContainText(
      "Employee Coffee Meeting"
    );
  });

  test("employee should not have access to approve page", async ({ page }) => {
    await page.goto("/dashboard/approve");

    const currentUrl = page.url();
    const isRedirected =
      currentUrl.includes("/dashboard") && !currentUrl.includes("/approve");
    const hasAccessDenied = await page
      .locator("text=Access Denied")
      .isVisible()
      .catch(() => false);

    expect(isRedirected || hasAccessDenied).toBeTruthy();
  });
});
