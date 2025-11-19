import { NextRequest, NextResponse } from "next/server";
import { verifyToken, extractTokenFromHeader } from "@/lib/auth";

/**
 * Get current user endpoint
 * Returns user info from JWT token
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json(
        { error: "No token provided" },
        { status: 401 }
      );
    }

    const jwtSecret = process.env.JWT_SECRET || "dev-secret-change-in-production";
    const payload = await verifyToken(token, jwtSecret);

    if (!payload) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // In production, you might want to fetch fresh user data from database
    // const db = createDatabaseClient(env);
    // const user = await db.queryFirst("SELECT * FROM users WHERE id = ?", [payload.userId]);

    return NextResponse.json({
      success: true,
      user: {
        id: payload.userId,
        email: payload.email,
        role: payload.role,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      {
        error: "Failed to get user info",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
