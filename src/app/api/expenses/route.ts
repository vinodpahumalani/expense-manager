import { NextRequest, NextResponse } from "next/server";
import { ExpenseModel } from "@/models";
import { authenticateToken } from "@/lib/auth";
import { ExpenseFilters, ExpenseCategory, ExpenseStatus } from "@/types";
import { handleApiError } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const user = authenticateToken(request);

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const filters: ExpenseFilters = {};

    if (user.role === "employee") {
      filters.userId = user.userId;
    }

    if (category) filters.category = category as ExpenseCategory;
    if (status) filters.status = status as ExpenseStatus;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;

    const offset = (page - 1) * limit;
    filters.limit = limit;
    filters.offset = offset;

    const expenses = ExpenseModel.findWithFilters(filters);
    const total = ExpenseModel.countWithFilters({
      userId: filters.userId,
      category: filters.category,
      status: filters.status,
      startDate: filters.startDate,
      endDate: filters.endDate,
    });

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      expenses,
      pagination: {
        page,
        limit,
        total,
        pages: totalPages,
      },
    });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = authenticateToken(request);

    const body = await request.json();
    const { amount, category, description, date, receiptUrl } = body;

    if (!amount || !category || !description || !date) {
      return NextResponse.json(
        { error: "Amount, category, description, and date are required" },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
        { status: 400 }
      );
    }

    const expenseDate = new Date(date);
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);

    if (expenseDate > today) {
      return NextResponse.json(
        { error: "Expense date cannot be in the future" },
        { status: 400 }
      );
    }

    if (expenseDate < oneYearAgo) {
      return NextResponse.json(
        { error: "Expense date cannot be older than one year" },
        { status: 400 }
      );
    }

    const expenseId = ExpenseModel.create({
      userId: user.userId,
      amount,
      category,
      description,
      date: new Date(date),
      receiptUrl,
      status: "pending",
    });

    const expense = ExpenseModel.findById(expenseId.toString());

    return NextResponse.json(
      { expense, message: "Expense created successfully" },
      { status: 201 }
    );
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
