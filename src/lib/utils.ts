import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { UserResponse } from "@/types";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";

export const generateToken = (user: UserResponse): string => {
  return jwt.sign(
    {
      userId: user._id,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
};

export const verifyToken = (
  token: string
): { userId: string; email: string; role: string } => {
  try {
    return jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
      role: string;
    };
  } catch {
    throw new Error("Invalid token");
  }
};

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

export const formatDate = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

export const parseDate = (dateString: string): Date => {
  return new Date(dateString);
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

export class ApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = "ApiError";
  }
}

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "An unknown error occurred";
};

export const getErrorStatusCode = (error: unknown): number => {
  if (error instanceof ApiError) {
    return error.statusCode;
  }
  if (error instanceof Error) {
    if (
      error.message.includes("token") ||
      error.message === "Admin access required" ||
      error.message.includes("authentication") ||
      error.message.includes("unauthorized")
    ) {
      return 401;
    }
    if (
      error.message.includes("required") ||
      error.message.includes("invalid") ||
      error.message.includes("must be")
    ) {
      return 400;
    }
    if (error.message.includes("not found")) {
      return 404;
    }
  }
  return 500;
};

export const handleApiError = (error: unknown): NextResponse => {
  const message = getErrorMessage(error);
  const statusCode = getErrorStatusCode(error);

  console.error("API Error:", error);

  return NextResponse.json({ error: message }, { status: statusCode });
};
