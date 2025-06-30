export interface User {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: "employee" | "admin";
  createdAt: Date;
  updatedAt: Date;
}

export interface UserResponse {
  _id: string;
  name: string;
  email: string;
  role: "employee" | "admin";
  createdAt: Date;
  updatedAt: Date;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: "employee" | "admin";
  iat?: number;
  exp?: number;
}

export interface Expense {
  _id: string;
  userId: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  date: Date;
  status: ExpenseStatus;
  receiptUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
}

export interface ExpenseDisplay {
  _id: string;
  userId: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  date: string;
  status: ExpenseStatus;
  receiptUrl?: string;
  createdAt: string;
  updatedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  user?: {
    name: string;
    email: string;
  };
}

export type ExpenseCategory =
  | "travel"
  | "meals"
  | "office_supplies"
  | "software"
  | "training"
  | "marketing"
  | "other";

export type ExpenseStatus = "pending" | "approved" | "rejected";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: UserResponse;
  token: string;
}

export interface CreateExpenseRequest {
  amount: number;
  category: ExpenseCategory;
  description: string;
  date: string;
}

export interface UpdateExpenseStatusRequest {
  status: ExpenseStatus;
  rejectionReason?: string;
}

export interface ExpenseAnalytics {
  summary: {
    totalExpenses: number;
    totalCount: number;
    averageExpense: number;
  };
  categoryStats: CategoryStat[];
  monthlyStats: MonthlyStat[];
  statusBreakdown: StatusBreakdown[];
}

export interface CategoryStat {
  category: ExpenseCategory;
  totalAmount: number;
  count: number;
  averageAmount: number;
}

export interface MonthlyStat {
  month: string;
  totalAmount: number;
  count: number;
}

export interface StatusBreakdown {
  status: ExpenseStatus;
  count: number;
  totalAmount: number;
}

export interface CategoryBreakdown {
  category: ExpenseCategory;
  amount: number;
  count: number;
  percentage: number;
}

export interface MonthlyTrend {
  month: string;
  amount: number;
  count: number;
}
export interface ExpenseFilters {
  category?: ExpenseCategory;
  status?: ExpenseStatus;
  startDate?: string;
  endDate?: string;
  userId?: string;
  limit?: number;
  offset?: number;
}
export interface AuthState {
  user: UserResponse | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export interface ExpenseState {
  expenses: Expense[];
  analytics: ExpenseAnalytics | null;
  isLoading: boolean;
  error: string | null;
  filters: ExpenseFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null;
}

export interface RootState {
  auth: AuthState;
  expenses: ExpenseState;
}
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
export interface DatabaseExpense {
  id: number;
  user_id: number;
  amount: number;
  category: string;
  description: string;
  date: string;
  status: string;
  receipt_url?: string;
  approved_by?: number;
  approved_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseUser {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
  created_at: string;
  updated_at: string;
}
export interface ExpenseQueryFilters {
  userId?: string;
  category?: ExpenseCategory;
  status?: ExpenseStatus;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}
export interface SummaryStats {
  totalExpenses: number;
  totalCount: number;
  averageExpense: number;
}

export interface CategoryStats {
  category: string;
  totalAmount: number;
  count: number;
  averageAmount: number;
}

export interface MonthlyStats {
  month: string;
  totalAmount: number;
  count: number;
}

export interface StatusStats {
  status: string;
  count: number;
  totalAmount: number;
}
export interface CreateExpensePayload {
  token: string;
  expenseData: CreateExpenseRequest;
}

export interface FetchExpensesPayload {
  token: string;
  filters?: ExpenseFilters;
}

export interface ApproveExpensePayload {
  token: string;
  expenseId: string;
  status: ExpenseStatus;
  rejectionReason?: string;
}

export interface FetchAnalyticsPayload {
  token: string;
  filters?: ExpenseFilters;
}
