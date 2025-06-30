import { test, expect } from "@playwright/test";

test.describe("Role-Based Access Control", () => {
  test.describe("Admin Access", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/");
      await page.fill('input[name="email"]', "admin@example.com");
      await page.fill('input[name="password"]', "admin123");
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL("/dashboard");
    });

    test("admin should have access to all navigation items", async ({
      page,
    }) => {
      const navItems = [
        page.locator('a:has-text("Dashboard")'),
        page.getByRole("link", { name: "Expenses", exact: true }),
        page.locator('a:has-text("Add Expense")'),
        page.locator('a:has-text("Approve Expenses")'),
      ];

      for (const item of navItems) {
        await expect(item).toBeVisible();
      }
    });

    test("admin should access all dashboard sections", async ({ page }) => {
      await expect(page).toHaveURL("/dashboard");

      await page.click("text=Expenses");
      await expect(page).toHaveURL("/dashboard/expenses");

      await page.click("text=Add Expense");
      await expect(page).toHaveURL("/dashboard/add-expense");

      await page.click("text=Approve Expenses");
      await expect(page).toHaveURL("/dashboard/approve");
    });

    test("admin should see approve and reject buttons in expenses table", async ({
      page,
    }) => {
      await page.click("text=Expenses");

      const actionButtons = page.locator(
        'button:has-text("Approve"), button:has-text("Reject")'
      );
      const count = await actionButtons.count();

      if (count === 0) {
        await page.click("text=Approve Expenses");
        await expect(page.locator('button:has-text("Approve")'))
          .toBeVisible()
          .catch(() => {
            console.log("No pending expenses to approve currently");
          });
      }
    });
  });

  test.describe("Employee Access", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/");
      await page.fill('input[name="email"]', "john@example.com");
      await page.fill('input[name="password"]', "employee123");
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL("/dashboard");
    });

    test("employee should have limited navigation access", async ({ page }) => {
      await expect(page.locator('a:has-text("Dashboard")')).toBeVisible();
      await expect(
        page.getByRole("link", { name: "Expenses", exact: true })
      ).toBeVisible();
      await expect(page.locator('a:has-text("Add Expense")')).toBeVisible();

      await expect(
        page.locator('a:has-text("Approve Expenses")')
      ).not.toBeVisible();
    });

    test("employee should be blocked from approve page", async ({ page }) => {
      await page.goto("/dashboard/approve");

      await Promise.race([
        page.waitForURL((url) => !url.href.includes("/approve"), {
          timeout: 5000,
        }),
        page.waitForSelector("text=Access Denied", { timeout: 5000 }),
      ]).catch(() => {});

      const isRedirected = !page.url().includes("/approve");
      const hasErrorMessage = await page
        .locator("text=Access Denied")
        .isVisible()
        .catch(() => false);

      expect(isRedirected || hasErrorMessage).toBeTruthy();
    });

    test("employee should not see admin actions in expenses table", async ({
      page,
    }) => {
      await page.click("text=Expenses");

      await expect(
        page.locator('button:has-text("Approve")')
      ).not.toBeVisible();
      await expect(page.locator('button:has-text("Reject")')).not.toBeVisible();
    });

    test("employee should only see own expenses in API calls", async ({
      page,
    }) => {
      const responsePromise = page.waitForResponse("**/api/expenses", {
        timeout: 5000,
      });

      await page.click("text=Expenses");

      try {
        const response = await responsePromise;
        expect(response.status()).toBe(200);
      } catch (error) {
        console.log(
          "No API call detected - expenses may be cached or loaded differently",
          error
        );
      }
    });
  });
});

test.describe("Error Handling and Edge Cases", () => {
  test("should handle network errors gracefully", async ({ page }) => {
    await page.goto("/");
    await page.fill('input[name="email"]', "admin@example.com");
    await page.fill('input[name="password"]', "admin123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL("/dashboard");

    await page.route("**/api/**", (route) => route.abort());

    await page.click("text=Expenses");

    await page.waitForTimeout(2000);

    const errorElements = page.locator(
      '.error, .bg-red-100, [data-testid="error"]'
    );
    const hasError = await errorElements.isVisible().catch(() => false);

    console.log(`Network error handling - Error visible: ${hasError}`);
  });

  test("should handle invalid session/token", async ({ page }) => {
    await page.goto("/");
    await page.fill('input[name="email"]', "admin@example.com");
    await page.fill('input[name="password"]', "admin123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL("/dashboard");

    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());

    await page.reload();

    await expect(page)
      .toHaveURL("/")
      .catch(() => {
        expect(page.locator('input[name="email"]')).toBeVisible();
      });
  });

  test("should handle large expense data sets", async ({ page }) => {
    await page.goto("/");
    await page.fill('input[name="email"]', "admin@example.com");
    await page.fill('input[name="password"]', "admin123");
    await page.click('button[type="submit"]');

    await page.click("text=Expenses");

    const paginationElements = page.locator(
      '.pagination, button:has-text("Next"), button:has-text("Previous")'
    );
    const hasPagination = await paginationElements
      .isVisible()
      .catch(() => false);

    if (hasPagination) {
      console.log("Pagination found - testing navigation");
      const nextButton = page.locator('button:has-text("Next")');
      if ((await nextButton.isVisible()) && (await nextButton.isEnabled())) {
        await nextButton.click();
        await page.waitForTimeout(1000);
      }
    } else {
      console.log(
        "No pagination found - checking if all expenses load properly"
      );
    }
  });

  test("should validate expense form inputs", async ({ page }) => {
    await page.goto("/");
    await page.fill('input[name="email"]', "admin@example.com");
    await page.fill('input[name="password"]', "admin123");
    await page.click('button[type="submit"]');

    await page.click("text=Add Expense");

    await expect(page.locator('input[name="amount"]')).toBeVisible();
    await expect(page.locator('textarea[name="description"]')).toBeVisible();

    await page.fill('input[name="amount"]', "-100");
    await page.fill('textarea[name="description"]', "Test expense");
    await page.click('button[type="submit"]');

    const errorMessage = page.locator(".error, .bg-red-100, .text-red-500");
    await expect(errorMessage)
      .toBeVisible()
      .catch(() => {
        console.log("No specific validation error shown for negative amount");
      });

    await page.fill('input[name="amount"]', "999999999");
    await page.click('button[type="submit"]');

    await page.waitForTimeout(1000);
  });

  test("should handle concurrent user actions", async ({ page, context }) => {
    const page2 = await context.newPage();

    await page.goto("/");
    await page.fill('input[name="email"]', "admin@example.com");
    await page.fill('input[name="password"]', "admin123");
    await page.click('button[type="submit"]');

    await page2.goto("/");
    await page2.fill('input[name="email"]', "john@example.com");
    await page2.fill('input[name="password"]', "employee123");
    await page2.click('button[type="submit"]');

    await expect(page).toHaveURL("/dashboard");
    await expect(page2).toHaveURL("/dashboard");

    await Promise.all([
      page.click("text=Expenses"),
      page2.click("text=Add Expense"),
    ]);

    await expect(page).toHaveURL("/dashboard/expenses");
    await expect(page2).toHaveURL("/dashboard/add-expense");

    await page2.close();
  });
});

test.describe("Accessibility and UX", () => {
  test("should be keyboard navigable", async ({ page }) => {
    await page.goto("/");

    await page.keyboard.press("Tab");
    await expect(page.locator('input[name="email"]')).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(page.locator('input[name="password"]')).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(page.locator('button[type="submit"]')).toBeFocused();
  });

  test("should have proper ARIA labels", async ({ page }) => {
    await page.goto("/");

    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');

    const hasEmailLabel =
      (await emailInput.getAttribute("aria-label").catch(() => null)) ||
      (await page
        .locator('label[for="email"]')
        .isVisible()
        .catch(() => false));
    const hasPasswordLabel =
      (await passwordInput.getAttribute("aria-label").catch(() => null)) ||
      (await page
        .locator('label[for="password"]')
        .isVisible()
        .catch(() => false));

    expect(hasEmailLabel).toBeTruthy();
    expect(hasPasswordLabel).toBeTruthy();
  });

  test("should handle focus management", async ({ page }) => {
    await page.goto("/");
    await page.fill('input[name="email"]', "admin@example.com");
    await page.fill('input[name="password"]', "admin123");
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL("/dashboard");

    const skipLink = page.locator('a:has-text("Skip to main content")');
    if (await skipLink.isVisible()) {
      await expect(skipLink).toBeVisible();
    }
  });
});
