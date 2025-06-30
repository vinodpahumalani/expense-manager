import { NextRequest, NextResponse } from "next/server";
import { ExpenseModel } from "@/models";
import { authenticateToken, requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/utils";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = authenticateToken(request);
    requireAdmin(user.role);

    const body = await request.json();
    const { status, rejectionReason } = body;
    const { id } = await params;

    if (!status || !["approved", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Valid status (approved/rejected) is required" },
        { status: 400 }
      );
    }

    if (status === "rejected" && !rejectionReason) {
      return NextResponse.json(
        { error: "Rejection reason is required when rejecting an expense" },
        { status: 400 }
      );
    }

    const success = ExpenseModel.updateStatus(
      id,
      status,
      user.userId,
      rejectionReason
    );

    if (!success) {
      return NextResponse.json({ error: "Expense not found" }, { status: 404 });
    }

    const expense = ExpenseModel.findById(id);

    return NextResponse.json({
      expense,
      message: `Expense ${status} successfully`,
    });
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
