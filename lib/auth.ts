/**
 * Authentication utilities for JWT and password hashing
 */

import * as jose from "jose";
import bcrypt from "bcryptjs";

/**
 * User type from database
 */
export interface User {
  id: number;
  email: string;
  password_hash: string;
  nome: string;
  cognome: string;
  role: "admin" | "tecnico" | "user";
  active: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * JWT payload type
 */
export interface JWTPayload extends jose.JWTPayload {
  userId: number;
  email: string;
  role: "admin" | "tecnico" | "user";
}

/**
 * Hash a password using bcrypt
 * @param password Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Verify a password against a hash
 * @param password Plain text password
 * @param hash Hashed password from database
 * @returns True if password matches
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

/**
 * Generate a JWT token for a user
 * @param user User object from database
 * @param secret JWT secret key
 * @param expiresIn Token expiration time (default: 24h)
 * @returns JWT token string
 */
export async function generateToken(
  user: Pick<User, "id" | "email" | "role">,
  secret: string,
  expiresIn: string = "24h"
): Promise<string> {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const secretKey = new TextEncoder().encode(secret);

  const token = await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secretKey);

  return token;
}

/**
 * Verify and decode a JWT token
 * @param token JWT token string
 * @param secret JWT secret key
 * @returns Decoded payload or null if invalid
 */
export async function verifyToken(
  token: string,
  secret: string
): Promise<JWTPayload | null> {
  try {
    const secretKey = new TextEncoder().encode(secret);

    const { payload } = await jose.jwtVerify(token, secretKey);

    return payload as JWTPayload;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}

/**
 * Extract token from Authorization header
 * @param authHeader Authorization header value
 * @returns Token string or null
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.substring(7); // Remove "Bearer " prefix
}

/**
 * Check if user has required role
 * @param userRole User's role
 * @param requiredRole Required role
 * @returns True if user has required role or higher
 */
export function hasRole(
  userRole: "admin" | "tecnico" | "user",
  requiredRole: "admin" | "tecnico" | "user"
): boolean {
  if (requiredRole === "user") {
    // All roles can access user-level resources
    return true;
  }

  if (requiredRole === "tecnico") {
    // Both admin and tecnico can access
    return userRole === "admin" || userRole === "tecnico";
  }

  // Only admin can access admin-only resources
  return userRole === "admin";
}

/**
 * Validate email format
 * @param email Email address
 * @returns True if valid email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * @param password Password to validate
 * @returns Object with isValid and errors
 */
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ============================================
// Client-side token management
// ============================================

/**
 * Store JWT token in localStorage
 * This function is SSR-safe and only executes in the browser
 *
 * @param token JWT token string
 *
 * @example
 * // After successful login
 * setAuthToken(data.token);
 */
export function setAuthToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token);
  }
}

/**
 * Retrieve JWT token from localStorage
 * This function is SSR-safe and returns null during SSR
 *
 * @returns Token string or null if not found or during SSR
 *
 * @example
 * const token = getAuthToken();
 * if (token) {
 *   // Use token
 * }
 */
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

/**
 * Remove JWT token from localStorage
 * This function is SSR-safe and only executes in the browser
 * Typically called during logout or when token is invalid
 *
 * @example
 * // During logout
 * clearAuthToken();
 * router.push("/login");
 */
export function clearAuthToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
  }
}

/**
 * Check if user is authenticated (has a token stored)
 * This function is SSR-safe and returns false during SSR
 *
 * Note: This only checks if a token exists, not if it's valid.
 * Token validation happens server-side via the withAuth middleware.
 *
 * @returns True if token exists in localStorage
 *
 * @example
 * if (!isAuthenticated()) {
 *   router.push("/login");
 * }
 */
export function isAuthenticated(): boolean {
  return getAuthToken() !== null;
}
