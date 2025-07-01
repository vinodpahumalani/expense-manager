# Expense Management System

A full-stack expense management web application with role-based access control built with Next.js, TypeScript, and SQLite.

## User Roles

**Employee**

- Submit and track personal expenses with categories and receipts
- View personal expense history and analytics dashboard
- Monitor approval status of submitted expenses

**Admin**

- Review and approve/reject all team expenses with reason notes
- Access team-wide analytics and reporting dashboards
- Manage expense workflow and oversight across the organization

## Getting Started

```bash
npm install
npm run dev
```

Default login credentials:

- Admin: `admin@example.com` / `admin123`
- Employee: `john@example.com` / `employee123`

## Database

Uses **SQLite** with better-sqlite3 for data storage. No setup required - the database file is automatically created with default users on first run. No external database server needed.

## API Endpoints

All API routes are located in `src/app/api/`

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Expenses

- `GET /api/expenses` - Get expenses (role-filtered)
- `POST /api/expenses` - Create new expense
- `PUT /api/expenses/[id]/approve` - Approve/reject expense (admin only)

### Analytics

- `GET /api/analytics` - Get analytics data (role-filtered)

## Testing

### End-to-End Testing with Playwright

This project includes comprehensive E2E testing using Playwright covering:

- ✅ **Authentication**: Login/logout, registration, error handling
- ✅ **Expense Management**: Creation, viewing, filtering, role-based access
- ✅ **Approval Workflow**: Admin approval/rejection, bulk operations
- ✅ **Analytics Dashboard**: Metrics, charts, responsive design
- ✅ **Security & RBAC**: Role-based access control, input validation

#### Running Tests

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run all tests
npm run test:e2e

# Run with UI mode (interactive)
npm run test:e2e:ui

# Run specific test file
npx playwright test tests/auth.spec.ts

# Debug mode
npm run test:e2e:debug
```

#### Test Reports

After running tests, view the detailed HTML report:

```bash
npx playwright show-report
```

#### Test Coverage

- **53 total tests** across 5 test suites
- Authentication, expense management, approvals, analytics, and RBAC

For detailed testing documentation, see [`TESTING.md`](./TESTING.md).

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test:e2e     # Run Playwright E2E tests
npm run test:e2e:ui  # Run tests with interactive UI
npm run test:e2e:headed    # Run tests with visible browser
npm run test:e2e:debug     # Run tests in debug mode
```
