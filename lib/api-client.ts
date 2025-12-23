/**
 * Centralized API client for automatic authentication and error handling
 *
 * This module provides a wrapper around the native fetch API that automatically:
 * - Injects JWT tokens from localStorage into Authorization headers
 * - Handles 401 errors by redirecting to login
 * - Provides structured error handling via ApiError class
 * - Aligns with server-side error handling patterns
 */

import type { ErrorResponse } from "./error-handler";

/**
 * Extended fetch options with authentication control
 */
export interface ApiFetchOptions extends RequestInit {
  /**
   * Skip automatic token injection
   * Use for public endpoints like /api/auth/login
   */
  skipAuth?: boolean;

  /**
   * Skip automatic redirect to /login on 401 errors
   * Use when you want to handle authentication errors manually
   */
  skipAuthRedirect?: boolean;
}

/**
 * Custom error class for API responses
 * Provides structured error information and helper methods
 */
export class ApiError extends Error {
  /**
   * HTTP status code
   */
  status: number;

  /**
   * Parsed error response from server
   */
  response: ErrorResponse;

  constructor(status: number, response: ErrorResponse) {
    super(response.message || response.error);
    this.name = "ApiError";
    this.status = status;
    this.response = response;
  }

  /**
   * Check if error is an authentication error (401)
   */
  isAuthError(): boolean {
    return this.status === 401;
  }

  /**
   * Check if error is a forbidden error (403)
   */
  isForbiddenError(): boolean {
    return this.status === 403;
  }

  /**
   * Check if error is a validation error (400 with details)
   */
  isValidationError(): boolean {
    return this.status === 400 && Array.isArray(this.response.details);
  }

  /**
   * Check if error is a not found error (404)
   */
  isNotFoundError(): boolean {
    return this.status === 404;
  }
}

/**
 * Retrieve JWT token from localStorage
 * @returns Token string or null if not found
 */
function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

/**
 * Clear token from localStorage and redirect to login
 * Called automatically on 401 errors unless skipAuthRedirect is true
 */
function handleAuthError(): void {
  if (typeof window === "undefined") return;

  // Clear invalid token
  localStorage.removeItem("token");

  // Redirect to login
  window.location.href = "/login";
}

/**
 * Centralized fetch wrapper with automatic authentication
 *
 * This function wraps the native fetch API and automatically:
 * - Injects Authorization header with JWT token from localStorage
 * - Adds Content-Type: application/json for non-FormData requests
 * - Handles 401 errors by clearing token and redirecting to login
 * - Throws structured ApiError on non-ok responses
 *
 * @param input - URL or Request object
 * @param init - Fetch options with additional auth controls
 * @returns Promise that resolves to Response
 * @throws {ApiError} When response is not ok
 *
 * @example
 * // Basic GET request
 * const response = await apiFetch("/api/attivita");
 * const data = await response.json();
 *
 * @example
 * // POST request with data
 * const response = await apiFetch("/api/attivita", {
 *   method: "POST",
 *   body: JSON.stringify({ id_cliente: 1, modello: "X100" }),
 * });
 *
 * @example
 * // Login endpoint (skip auth)
 * const response = await apiFetch("/api/auth/login", {
 *   method: "POST",
 *   skipAuth: true,
 *   body: JSON.stringify({ email, password }),
 * });
 *
 * @example
 * // Custom error handling (skip auto-redirect)
 * try {
 *   const response = await apiFetch("/api/attivita", {
 *     skipAuthRedirect: true,
 *   });
 * } catch (error) {
 *   if (error instanceof ApiError && error.isAuthError()) {
 *     // Handle auth error manually
 *   }
 * }
 */
export async function apiFetch(
  input: RequestInfo | URL,
  init?: ApiFetchOptions
): Promise<Response> {
  const { skipAuth, skipAuthRedirect, ...fetchInit } = init || {};

  // Prepare headers
  const headers = new Headers(fetchInit.headers);

  // Add Authorization header unless skipAuth is true
  if (!skipAuth) {
    const token = getToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  // Add Content-Type for JSON requests (unless it's FormData or already set)
  if (
    fetchInit.body &&
    !(fetchInit.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  // Execute fetch with prepared headers
  const response = await fetch(input, {
    ...fetchInit,
    headers,
  });

  // Handle non-ok responses
  if (!response.ok) {
    let errorResponse: ErrorResponse;

    try {
      // Try to parse error response
      errorResponse = await response.json();
    } catch {
      // Fallback if response is not JSON
      errorResponse = {
        error: response.statusText || "Request failed",
        message: `HTTP ${response.status}`,
        timestamp: new Date().toISOString(),
      };
    }

    // Handle 401 authentication errors
    if (response.status === 401 && !skipAuthRedirect) {
      handleAuthError();
      // handleAuthError redirects, but throw error anyway for cleanup
      throw new ApiError(response.status, errorResponse);
    }

    // Throw structured error for all other non-ok responses
    throw new ApiError(response.status, errorResponse);
  }

  return response;
}

/**
 * Convenience method for GET requests
 *
 * @param url - API endpoint URL
 * @param init - Optional fetch options
 * @returns Promise that resolves to parsed JSON data
 *
 * @example
 * const data = await apiGet<{ success: boolean; data: Attivita[] }>(
 *   "/api/attivita?id_cliente=1"
 * );
 */
export async function apiGet<T = any>(
  url: string,
  init?: ApiFetchOptions
): Promise<T> {
  const response = await apiFetch(url, {
    ...init,
    method: "GET",
  });
  return response.json();
}

/**
 * Convenience method for POST requests
 *
 * @param url - API endpoint URL
 * @param data - Data to send in request body (will be JSON stringified)
 * @param init - Optional fetch options
 * @returns Promise that resolves to parsed JSON data
 *
 * @example
 * const result = await apiPost<{ success: boolean; data: Attivita }>(
 *   "/api/attivita",
 *   { id_cliente: 1, modello: "X100" }
 * );
 */
export async function apiPost<T = any>(
  url: string,
  data?: any,
  init?: ApiFetchOptions
): Promise<T> {
  const response = await apiFetch(url, {
    ...init,
    method: "POST",
    body: data ? JSON.stringify(data) : undefined,
  });
  return response.json();
}

/**
 * Convenience method for PUT requests
 *
 * @param url - API endpoint URL
 * @param data - Data to send in request body (will be JSON stringified)
 * @param init - Optional fetch options
 * @returns Promise that resolves to parsed JSON data
 *
 * @example
 * const result = await apiPut<{ success: boolean }>(
 *   "/api/attivita/123",
 *   { modello: "X200" }
 * );
 */
export async function apiPut<T = any>(
  url: string,
  data?: any,
  init?: ApiFetchOptions
): Promise<T> {
  const response = await apiFetch(url, {
    ...init,
    method: "PUT",
    body: data ? JSON.stringify(data) : undefined,
  });
  return response.json();
}

/**
 * Convenience method for DELETE requests
 *
 * @param url - API endpoint URL
 * @param init - Optional fetch options
 * @returns Promise that resolves to parsed JSON data
 *
 * @example
 * await apiDelete("/api/attivita/123");
 */
export async function apiDelete<T = any>(
  url: string,
  init?: ApiFetchOptions
): Promise<T> {
  const response = await apiFetch(url, {
    ...init,
    method: "DELETE",
  });

  // Handle 204 No Content responses
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

/**
 * Convenience method for PATCH requests
 *
 * @param url - API endpoint URL
 * @param data - Data to send in request body (will be JSON stringified)
 * @param init - Optional fetch options
 * @returns Promise that resolves to parsed JSON data
 *
 * @example
 * const result = await apiPatch<{ success: boolean }>(
 *   "/api/attivita/123",
 *   { note: "Updated notes" }
 * );
 */
export async function apiPatch<T = any>(
  url: string,
  data?: any,
  init?: ApiFetchOptions
): Promise<T> {
  const response = await apiFetch(url, {
    ...init,
    method: "PATCH",
    body: data ? JSON.stringify(data) : undefined,
  });
  return response.json();
}
