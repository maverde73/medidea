/**
 * Middleware utilities for authentication and authorization
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyToken, extractTokenFromHeader, hasRole, type JWTPayload } from "./auth";

/**
 * Authentication result type
 */
export interface AuthResult {
  success: boolean;
  user?: JWTPayload;
  error?: string;
}

/**
 * Middleware to verify JWT token
 * @param request Next.js request object
 * @param jwtSecret JWT secret key
 * @returns Authentication result
 */
export async function authenticateRequest(
  request: NextRequest,
  jwtSecret: string
): Promise<AuthResult> {
  const authHeader = request.headers.get("Authorization");
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    return {
      success: false,
      error: "No token provided",
    };
  }

  const payload = await verifyToken(token, jwtSecret);

  if (!payload) {
    return {
      success: false,
      error: "Invalid or expired token",
    };
  }

  return {
    success: true,
    user: payload,
  };
}

/**
 * Middleware to check if user has required role
 * @param user JWT payload with user info
 * @param requiredRole Required role ("admin" or "tecnico")
 * @returns Authorization result
 */
export function authorizeRole(
  user: JWTPayload,
  requiredRole: "admin" | "tecnico"
): { success: boolean; error?: string } {
  if (!hasRole(user.role, requiredRole)) {
    return {
      success: false,
      error: `Insufficient permissions. Required role: ${requiredRole}`,
    };
  }

  return { success: true };
}

/**
 * Create unauthorized response
 * @param message Error message
 * @returns NextResponse with 401 status
 */
export function unauthorizedResponse(message: string = "Unauthorized"): NextResponse {
  return NextResponse.json({ error: message }, { status: 401 });
}

/**
 * Create forbidden response
 * @param message Error message
 * @returns NextResponse with 403 status
 */
export function forbiddenResponse(message: string = "Forbidden"): NextResponse {
  return NextResponse.json({ error: message }, { status: 403 });
}

/**
 * Helper to wrap API routes with authentication
 * Usage example:
 *
 * export const GET = withAuth(async (request, { user }) => {
 *   // user is guaranteed to be authenticated here
 *   return NextResponse.json({ message: `Hello ${user.email}` });
 * });
 *
 * For dynamic routes with params:
 *
 * export const GET = withAuth<{ params: Promise<{ id: string }> }>(
 *   async (request, { user, params }) => {
 *     const { id } = await params;
 *     return NextResponse.json({ id, user });
 *   }
 * );
 */

// Overload for non-dynamic routes (no route context)
export function withAuth(
  handler: (
    request: NextRequest,
    context: { user: JWTPayload }
  ) => Promise<NextResponse>,
  options?: {
    requiredRole?: "admin" | "tecnico";
  }
): (request: NextRequest) => Promise<NextResponse>;

// Overload for dynamic routes (with route context)
export function withAuth<T extends Record<string, any>>(
  handler: (
    request: NextRequest,
    context: { user: JWTPayload } & T
  ) => Promise<NextResponse>,
  options?: {
    requiredRole?: "admin" | "tecnico";
  }
): (request: NextRequest, routeContext: T) => Promise<NextResponse>;

// Implementation
export function withAuth<T extends Record<string, any> = {}>(
  handler: (
    request: NextRequest,
    context: { user: JWTPayload } & T
  ) => Promise<NextResponse>,
  options?: {
    requiredRole?: "admin" | "tecnico";
  }
) {
  return async (
    request: NextRequest,
    routeContext?: T
  ): Promise<NextResponse> => {
    const jwtSecret = process.env.JWT_SECRET || "dev-secret-change-in-production";

    // Authenticate request
    const authResult = await authenticateRequest(request, jwtSecret);

    if (!authResult.success || !authResult.user) {
      return unauthorizedResponse(authResult.error);
    }

    // Check role if required
    if (options?.requiredRole) {
      const authzResult = authorizeRole(authResult.user, options.requiredRole);

      if (!authzResult.success) {
        return forbiddenResponse(authzResult.error);
      }
    }

    // Call the handler with authenticated user and any route context (like params)
    return handler(request, {
      user: authResult.user,
      ...(routeContext || {}),
    } as { user: JWTPayload } & T);
  };
}
