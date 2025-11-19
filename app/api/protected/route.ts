import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware";

/**
 * Protected endpoint example
 * Requires authentication via JWT
 */
export const GET = withAuth(async (request, { user }) => {
  return NextResponse.json({
    success: true,
    message: "You are authenticated!",
    user: {
      id: user.userId,
      email: user.email,
      role: user.role,
    },
    timestamp: new Date().toISOString(),
  });
});

/**
 * Admin-only endpoint example
 * Requires authentication AND admin role
 */
export const POST = withAuth(
  async (request, { user }) => {
    return NextResponse.json({
      success: true,
      message: "You are an admin!",
      user: {
        id: user.userId,
        email: user.email,
        role: user.role,
      },
      timestamp: new Date().toISOString(),
    });
  },
  { requiredRole: "admin" }
);
