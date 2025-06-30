"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { fetchExpenses, approveExpense } from "@/store/slices/expenseSlice";
import { AppDispatch, RootState } from "@/store";
import { CheckCircle, XCircle, Eye, Clock } from "lucide-react";
import { Expense } from "@/types";

export default function ApproveExpensesPage() {
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showModal, setShowModal] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const { expenses, isLoading, error } = useSelector(
    (state: RootState) => state.expenses
  );
  const { token, user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (token && user?.role === "admin") {
      dispatch(
        fetchExpenses({
          token,
          filters: { status: "pending" },
        })
      );
    }
  }, [token, user, dispatch]);

  const handleApprove = async (expenseId: string) => {
    if (token) {
      await dispatch(
        approveExpense({
          token,
          expenseId,
          status: "approved",
        })
      );

      dispatch(
        fetchExpenses({
          token,
          filters: { status: "pending" },
        })
      );
    }
  };

  const handleReject = (expense: Expense) => {
    setSelectedExpense(expense);
    setShowModal(true);
  };

  const confirmReject = async () => {
    if (token && selectedExpense && rejectionReason.trim()) {
      await dispatch(
        approveExpense({
          token,
          expenseId: selectedExpense._id,
          status: "rejected",
          rejectionReason: rejectionReason.trim(),
        })
      );

      dispatch(
        fetchExpenses({
          token,
          filters: { status: "pending" },
        })
      );

      setShowModal(false);
      setSelectedExpense(null);
      setRejectionReason("");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (user?.role !== "admin") {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600">
            You don&apos;t have permission to access this page.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div>
        <div className="flex items-center space-x-3 mb-8">
          <Clock className="h-8 w-8 text-yellow-600" />
          <h1 className="text-2xl font-bold text-gray-900">
            Pending Approvals
          </h1>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading pending expenses...</p>
            </div>
          ) : expenses.length === 0 ? (
            <div className="p-8 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                All caught up!
              </h3>
              <p className="text-gray-600">
                No expenses are waiting for approval.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {expenses.map((expense: Expense) => (
                <div key={expense._id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-center space-x-4 mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900">
                            {expense.description}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Submitted on {formatDate(expense.createdAt)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">
                            {formatCurrency(expense.amount)}
                          </p>
                          <p className="text-sm text-gray-600 capitalize">
                            {expense.category.replace("_", " ")}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Expense Date
                          </p>
                          <p className="text-sm text-gray-900">
                            {formatDate(expense.date)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Category
                          </p>
                          <p className="text-sm text-gray-900 capitalize">
                            {expense.category.replace("_", " ")}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            Amount
                          </p>
                          <p className="text-sm text-gray-900">
                            {formatCurrency(expense.amount)}
                          </p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Description
                        </p>
                        <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-md">
                          {expense.description}
                        </p>
                      </div>

                      {expense.receiptUrl && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            Receipt
                          </p>
                          <a
                            href={expense.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800"
                          >
                            <Eye className="h-4 w-4" />
                            <span>View Receipt</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleReject(expense)}
                      className="flex items-center space-x-2 px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <XCircle className="h-4 w-4" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => handleApprove(expense._id)}
                      className="flex items-center space-x-2 px-4 py-2 border border-transparent text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Approve</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Reject Expense
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Please provide a reason for rejecting this expense:
                </p>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                  rows={4}
                  placeholder="Enter rejection reason..."
                />
                <div className="flex justify-end space-x-3 mt-4">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setSelectedExpense(null);
                      setRejectionReason("");
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmReject}
                    disabled={!rejectionReason.trim()}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Reject Expense
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
