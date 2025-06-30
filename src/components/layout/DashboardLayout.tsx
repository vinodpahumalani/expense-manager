"use client";

import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState } from "@/store";
import { logout } from "@/store/slices/authSlice";
import {
  LogOut,
  User,
  DollarSign,
  BarChart3,
  FileText,
  CheckCircle,
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    dispatch(logout());
    router.push("/");
  };

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Expense Tracker
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">{user?.name}</span>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    user?.role === "admin"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {user?.role}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        <div className="w-64 bg-white shadow-sm min-h-screen">
          <nav className="mt-8 px-4 space-y-2">
            <SidebarLink
              href="/dashboard"
              icon={<BarChart3 className="h-5 w-5" />}
              text="Dashboard"
            />
            <SidebarLink
              href="/dashboard/expenses"
              icon={<FileText className="h-5 w-5" />}
              text="Expenses"
            />
            <SidebarLink
              href="/dashboard/add-expense"
              icon={<DollarSign className="h-5 w-5" />}
              text="Add Expense"
            />
            {user?.role === "admin" && (
              <SidebarLink
                href="/dashboard/approve"
                icon={<CheckCircle className="h-5 w-5" />}
                text="Approve Expenses"
              />
            )}
          </nav>
        </div>

        <div className="flex-1 p-8">{children}</div>
      </div>
    </div>
  );
}

function SidebarLink({
  href,
  icon,
  text,
}: {
  href: string;
  icon: React.ReactNode;
  text: string;
}) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(href);
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 py-2 rounded-md text-sm font-medium transition-colors"
    >
      {icon}
      <span>{text}</span>
    </a>
  );
}
