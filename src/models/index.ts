import db from "@/lib/db";
import {
  User,
  Expense,
  ExpenseCategory,
  ExpenseStatus,
  DatabaseExpense,
  DatabaseUser,
  SummaryStats,
  CategoryStats,
  MonthlyStats,
  StatusStats,
} from "@/types";

export const UserModel = {
  create: (userData: Omit<User, "_id" | "createdAt" | "updatedAt">) => {
    const stmt = db.prepare(`
      INSERT INTO users (name, email, password, role)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(
      userData.name,
      userData.email,
      userData.password,
      userData.role
    );
    return result.lastInsertRowid as number;
  },

  findByEmail: (email: string) => {
    const stmt = db.prepare("SELECT * FROM users WHERE email = ?");
    const user = stmt.get(email) as DatabaseUser | undefined;
    if (user) {
      return {
        _id: user.id.toString(),
        name: user.name,
        email: user.email,
        password: user.password,
        role: user.role as "employee" | "admin",
        createdAt: new Date(user.created_at),
        updatedAt: new Date(user.updated_at),
      } as User;
    }
    return null;
  },

  findById: (id: string) => {
    const stmt = db.prepare("SELECT * FROM users WHERE id = ?");
    const user = stmt.get(parseInt(id)) as DatabaseUser | undefined;
    if (user) {
      return {
        _id: user.id.toString(),
        name: user.name,
        email: user.email,
        password: user.password,
        role: user.role as "employee" | "admin",
        createdAt: new Date(user.created_at),
        updatedAt: new Date(user.updated_at),
      } as User;
    }
    return null;
  },
};

export const ExpenseModel = {
  create: (expenseData: Omit<Expense, "_id" | "createdAt" | "updatedAt">) => {
    const stmt = db.prepare(`
      INSERT INTO expenses (user_id, amount, category, description, date, status, receipt_url)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      parseInt(expenseData.userId),
      expenseData.amount,
      expenseData.category,
      expenseData.description,
      expenseData.date.toISOString().split("T")[0], // Convert to YYYY-MM-DD
      expenseData.status,
      expenseData.receiptUrl || null
    );
    return result.lastInsertRowid as number;
  },

  findWithFilters: (filters: {
    userId?: string;
    category?: ExpenseCategory;
    status?: ExpenseStatus;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }) => {
    let query = "SELECT * FROM expenses WHERE 1=1";
    const params: (string | number)[] = [];

    if (filters.userId) {
      query += " AND user_id = ?";
      params.push(parseInt(filters.userId));
    }
    if (filters.category) {
      query += " AND category = ?";
      params.push(filters.category);
    }
    if (filters.status) {
      query += " AND status = ?";
      params.push(filters.status);
    }
    if (filters.startDate) {
      query += " AND date >= ?";
      params.push(filters.startDate);
    }
    if (filters.endDate) {
      query += " AND date <= ?";
      params.push(filters.endDate);
    }

    query += " ORDER BY created_at DESC";

    if (filters.limit) {
      query += " LIMIT ?";
      params.push(filters.limit);
      if (filters.offset) {
        query += " OFFSET ?";
        params.push(filters.offset);
      }
    }

    const stmt = db.prepare(query);
    const expenses = stmt.all(...params) as DatabaseExpense[];

    return expenses.map((expense) => ({
      _id: expense.id.toString(),
      userId: expense.user_id.toString(),
      amount: expense.amount,
      category: expense.category as ExpenseCategory,
      description: expense.description,
      date: new Date(expense.date),
      status: expense.status as ExpenseStatus,
      receiptUrl: expense.receipt_url,
      approvedBy: expense.approved_by?.toString(),
      approvedAt: expense.approved_at
        ? new Date(expense.approved_at)
        : undefined,
      rejectionReason: expense.rejection_reason,
      createdAt: new Date(expense.created_at),
      updatedAt: new Date(expense.updated_at),
    })) as Expense[];
  },

  countWithFilters: (filters: {
    userId?: string;
    category?: ExpenseCategory;
    status?: ExpenseStatus;
    startDate?: string;
    endDate?: string;
  }) => {
    let query = "SELECT COUNT(*) as count FROM expenses WHERE 1=1";
    const params: (string | number)[] = [];

    if (filters.userId) {
      query += " AND user_id = ?";
      params.push(parseInt(filters.userId));
    }
    if (filters.category) {
      query += " AND category = ?";
      params.push(filters.category);
    }
    if (filters.status) {
      query += " AND status = ?";
      params.push(filters.status);
    }
    if (filters.startDate) {
      query += " AND date >= ?";
      params.push(filters.startDate);
    }
    if (filters.endDate) {
      query += " AND date <= ?";
      params.push(filters.endDate);
    }

    const stmt = db.prepare(query);
    const result = stmt.get(...params) as { count: number };
    return result.count;
  },

  findById: (id: string) => {
    const stmt = db.prepare("SELECT * FROM expenses WHERE id = ?");
    const expense = stmt.get(parseInt(id)) as DatabaseExpense | undefined;
    if (expense) {
      return {
        _id: expense.id.toString(),
        userId: expense.user_id.toString(),
        amount: expense.amount,
        category: expense.category as ExpenseCategory,
        description: expense.description,
        date: new Date(expense.date),
        status: expense.status as ExpenseStatus,
        receiptUrl: expense.receipt_url,
        approvedBy: expense.approved_by?.toString(),
        approvedAt: expense.approved_at
          ? new Date(expense.approved_at)
          : undefined,
        rejectionReason: expense.rejection_reason,
        createdAt: new Date(expense.created_at),
        updatedAt: new Date(expense.updated_at),
      } as Expense;
    }
    return null;
  },

  updateStatus: (
    id: string,
    status: ExpenseStatus,
    approvedBy?: string,
    rejectionReason?: string
  ) => {
    const stmt = db.prepare(`
      UPDATE expenses 
      SET status = ?, approved_by = ?, approved_at = ?, rejection_reason = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    const result = stmt.run(
      status,
      approvedBy ? parseInt(approvedBy) : null,
      status === "approved" ? new Date().toISOString() : null,
      rejectionReason || null,
      parseInt(id)
    );
    return result.changes > 0;
  },

  getAnalytics: (userId?: string) => {
    const userFilter = userId ? "WHERE user_id = ?" : "";
    const params = userId ? [parseInt(userId)] : [];

    // Summary stats
    const summaryStmt = db.prepare(`
      SELECT 
        COALESCE(SUM(amount), 0) as totalExpenses,
        COUNT(*) as totalCount,
        COALESCE(AVG(amount), 0) as averageExpense
      FROM expenses ${userFilter}
    `);
    const summary = summaryStmt.get(...params) as SummaryStats;

    const categoryStmt = db.prepare(`
      SELECT 
        category,
        SUM(amount) as totalAmount,
        COUNT(*) as count,
        AVG(amount) as averageAmount
      FROM expenses ${userFilter}
      GROUP BY category
      ORDER BY totalAmount DESC
    `);
    const categoryStats = categoryStmt.all(...params) as CategoryStats[];

    const monthlyStmt = db.prepare(`
      SELECT 
        strftime('%Y-%m', date) as month,
        SUM(amount) as totalAmount,
        COUNT(*) as count
      FROM expenses 
      WHERE date >= date('now', '-12 months') ${userId ? "AND user_id = ?" : ""}
      GROUP BY strftime('%Y-%m', date)
      ORDER BY month DESC
    `);
    const monthlyStats = monthlyStmt.all(...params) as MonthlyStats[];

    let statusBreakdown: StatusStats[] = [];
    if (!userId) {
      const statusStmt = db.prepare(`
        SELECT 
          status,
          COUNT(*) as count,
          SUM(amount) as totalAmount
        FROM expenses
        GROUP BY status
      `);
      statusBreakdown = statusStmt.all() as StatusStats[];
    }

    return {
      summary: {
        totalExpenses: summary.totalExpenses,
        totalCount: summary.totalCount,
        averageExpense: summary.averageExpense,
      },
      categoryStats,
      monthlyStats,
      statusBreakdown,
    };
  },
};
