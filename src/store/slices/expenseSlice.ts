import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ExpenseState, ExpenseFilters, CreateExpenseRequest } from "@/types";
import { getErrorMessage } from "@/lib/utils";

const initialState: ExpenseState = {
  expenses: [],
  analytics: null,
  isLoading: false,
  error: null,
  filters: {},
  pagination: null,
};

const getAuthHeaders = (token: string) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

const buildQueryParams = (filters: ExpenseFilters): string => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, String(value));
    }
  });
  return params.toString();
};

export const fetchExpenses = createAsyncThunk(
  "expenses/fetchExpenses",
  async (
    { token, filters = {} }: { token: string; filters?: ExpenseFilters },
    { rejectWithValue }
  ) => {
    try {
      const queryString = buildQueryParams(filters);
      const response = await fetch(`/api/expenses?${queryString}`, {
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.error || "Failed to fetch expenses");
      }

      const data = await response.json();
      return data;
    } catch (error: unknown) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const createExpense = createAsyncThunk(
  "expenses/createExpense",
  async (
    {
      token,
      expenseData,
    }: { token: string; expenseData: CreateExpenseRequest },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: getAuthHeaders(token),
        body: JSON.stringify(expenseData),
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.error || "Failed to create expense");
      }

      const data = await response.json();
      console.log("Expense created successfully:", data);

      return data;
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Network error"
      );
    }
  }
);

export const approveExpense = createAsyncThunk(
  "expenses/approveExpense",
  async (
    {
      token,
      expenseId,
      status,
      rejectionReason,
    }: {
      token: string;
      expenseId: string;
      status: "approved" | "rejected";
      rejectionReason?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(`/api/expenses/${expenseId}/approve`, {
        method: "PUT",
        headers: getAuthHeaders(token),
        body: JSON.stringify({ status, rejectionReason }),
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.error || "Failed to update expense");
      }

      const data = await response.json();
      return data;
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Network error"
      );
    }
  }
);

export const fetchAnalytics = createAsyncThunk(
  "expenses/fetchAnalytics",
  async (
    { token, filters = {} }: { token: string; filters?: ExpenseFilters },
    { rejectWithValue }
  ) => {
    try {
      const queryString = buildQueryParams(filters);
      const response = await fetch(`/api/analytics?${queryString}`, {
        headers: getAuthHeaders(token),
      });

      if (!response.ok) {
        const error = await response.json();
        return rejectWithValue(error.error || "Failed to fetch analytics");
      }

      const data = await response.json();
      return data;
    } catch (error: unknown) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Network error"
      );
    }
  }
);

const expenseSlice = createSlice({
  name: "expenses",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearExpenses: (state) => {
      state.expenses = [];
      state.pagination = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExpenses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.expenses = action.payload.expenses;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createExpense.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createExpense.fulfilled, (state, action) => {
        state.isLoading = false;
        state.expenses.unshift(action.payload.expense);
        state.error = null;
      })
      .addCase(createExpense.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(approveExpense.fulfilled, (state, action) => {
        const index = state.expenses.findIndex(
          (exp) => exp._id === action.payload.expense._id
        );
        if (index !== -1) {
          state.expenses[index] = action.payload.expense;
        }
      })
      .addCase(fetchAnalytics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analytics = action.payload;
        state.error = null;
      })
      .addCase(fetchAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearExpenses } = expenseSlice.actions;
export default expenseSlice.reducer;
