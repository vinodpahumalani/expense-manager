# Playwright Testing Guide

## Overview

This document provides comprehensive information about the end-to-end testing setup using Playwright for the Expense Management application.

## Test Structure

### 📁 Test Files

- **`tests/auth.spec.ts`** - authentication and user login/logout
- **`tests/expenses.spec.ts`** - expense creation, viewing, and management
- **`tests/approval.spec.ts`** - expense approval workflow (admin only)
- **`tests/analytics.spec.ts`** - dashboard analytics and reporting
- **`tests/rbac.spec.ts`** - role-based access control and security

### 🎯 Test Coverage

#### Authentication Tests

- ✅ Login form display
- ✅ Admin login functionality
- ✅ Employee login functionality
- ✅ Invalid credentials handling
- ✅ Registration form switching
- ✅ User registration
- ✅ Logout functionality

#### Expense Management Tests

- ✅ Navigation to expenses page
- ✅ Expenses table display
- ✅ Add expense functionality
- ✅ Form validation
- ✅ Filtering and searching
- ✅ Role-based access (employee vs admin)

#### Approval Workflow Tests

- ✅ Admin approval page access
- ✅ Pending expenses display
- ✅ Approve/reject functionality
- ✅ Bulk operations
- ✅ Employee access restrictions

#### Analytics Tests

- ✅ Dashboard metrics display
- ✅ Charts and visualizations
- ✅ Recent expenses
- ✅ Quick actions
- ✅ Responsive design

#### RBAC & Security Tests

- ✅ Admin access control
- ✅ Employee access restrictions
- ✅ Network error handling
- ✅ Session management
- ✅ Data validation
- ✅ Accessibility compliance

## 🚀 Running Tests

### Prerequisites

1. **Development Server**: Ensure the Next.js development server is running

   ```bash
   npm run dev
   ```

2. **Database**: Make sure the SQLite database is set up with test data

### Basic Commands

```bash
# Run all tests
npm run test:e2e

# Run tests with UI mode
npm run test:e2e:ui

# Run tests in headed mode (visible browser)
npm run test:e2e:headed

# Run tests in debug mode
npm run test:e2e:debug

# Run specific test file
npx playwright test tests/auth.spec.ts

# Run specific test by name
npx playwright test --grep "should login as admin"

# Run tests with different reporters
npx playwright test --reporter=html
npx playwright test --reporter=line
npx playwright test --reporter=dot
```

### PowerShell Script

Use the provided PowerShell script for enhanced test running:

```powershell
.\run-tests.ps1
```

## 📊 Test Reports

### HTML Report

- Generated automatically after test runs
- Located at: `playwright-report/index.html`
- Includes screenshots, videos, and traces for failed tests

### Viewing Reports

```bash
# Open HTML report
npx playwright show-report

# Open specific report
start playwright-report/index.html  # Windows
open playwright-report/index.html   # macOS
```

## 🔧 Configuration

### Playwright Config (`playwright.config.ts`)

```typescript
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
```

### Test Data

The tests use predefined test credentials:

- **Admin**: `admin@example.com` / `admin123`
- **Employee**: `john@example.com` / `employee123`

## 🐛 Debugging Tests

### Debug Mode

```bash
# Run in debug mode
npx playwright test --debug

# Debug specific test
npx playwright test tests/auth.spec.ts --debug
```

### Browser Developer Tools

```bash
# Run with browser dev tools
npx playwright test --headed --debug
```

### Screenshots and Videos

- Automatically captured on test failures
- Stored in `test-results/` directory
- Viewable in HTML report

## 📈 Best Practices

### Writing Tests

1. **Use Page Object Model** for reusable components
2. **Wait for elements** before interacting
3. **Use data-testid** attributes for stable selectors
4. **Keep tests independent** and idempotent
5. **Use meaningful test descriptions**

### Test Organization

```typescript
test.describe("Feature Name", () => {
  test.beforeEach(async ({ page }) => {
    // Setup for each test
  });

  test("should do something specific", async ({ page }) => {
    // Test implementation
  });
});
```

### Error Handling

```typescript
// Graceful error handling
await expect(page.locator(".error"))
  .toBeVisible()
  .catch(() => {
    console.log("No error message displayed");
  });
```

## 🔄 Continuous Integration

### GitHub Actions

```yaml
name: Playwright Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright
        run: npx playwright install --with-deps
      - name: Run tests
        run: npm run test:e2e
```

## 📱 Mobile Testing

Tests are configured for responsive design:

- Desktop Chrome (primary)
- Mobile viewports can be added to config

## 🔒 Security Testing

### Included Security Tests

- Authentication bypass attempts
- Role-based access control
- Session management
- Input validation
- XSS prevention

## 📚 Resources

- [Playwright Documentation](https://playwright.dev/)
- [Test Examples](https://github.com/microsoft/playwright/tree/main/tests)
- [Best Practices Guide](https://playwright.dev/docs/best-practices)

## 🆘 Troubleshooting

### Common Issues

1. **Server not running**

   ```bash
   Error: connect ECONNREFUSED ::1:3000
   ```

   Solution: Start the development server with `npm run dev`

2. **Timeout errors**

   ```bash
   Test timeout of 30000ms exceeded
   ```

   Solution: Increase timeout in config or use `page.waitForLoadState()`

3. **Element not found**
   ```bash
   Locator not found
   ```
   Solution: Check selectors and wait for elements to load

### Debug Commands

```bash
# Check which tests are available
npx playwright test --list

# Run with verbose output
npx playwright test --reporter=line --verbose

# Generate code for interactions
npx playwright codegen localhost:3000
```

## 📝 Test Maintenance

### Regular Tasks

- Update test data as application evolves
- Review and update selectors
- Add tests for new features
- Monitor test execution time
- Update browser versions

### Performance Monitoring

- Track test execution time
- Monitor flaky tests
- Optimize test parallelization
- Review resource usage

---

_This testing setup provides comprehensive coverage of the Expense Management application with robust error handling and detailed reporting._
