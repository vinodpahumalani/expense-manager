import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { TokenPayload } from "@/types";

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string;
    email: string;
    role: "employee" | "admin";
  };
}

export function authenticateToken(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    throw new Error("Access token required");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
    return {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };
  } catch (error) {
    console.error("Token verification failed:", error);
    throw new Error("Invalid or expired token");
  }
}

export function requireAdmin(userRole: string) {
  if (userRole !== "admin") {
    throw new Error("Admin access required");
  }
}

export function requireOwnershipOrAdmin(
  userId: string,
  requestUserId: string,
  userRole: string
) {
  if (userRole !== "admin" && userId !== requestUserId) {
    throw new Error("Access denied");
  }
}
