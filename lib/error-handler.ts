/**
 * Centralized error handling utilities
 */

import { NextResponse } from "next/server";
import { ZodError } from "zod";

/**
 * Standard error response format
 */
export interface ErrorResponse {
  error: string;
  message?: string;
  details?: Array<{ field: string; message: string }>;
  timestamp: string;
  path?: string;
}

/**
 * Handle Zod validation errors
 * @param error ZodError instance
 * @returns Formatted error response
 */
export function handleZodError(error: ZodError): ErrorResponse {
  return {
    error: "Dati non validi",
    details: error.issues.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    })),
    timestamp: new Date().toISOString(),
  };
}

/**
 * Handle generic errors
 * @param error Error instance
 * @param context Optional context information
 * @returns Formatted error response
 */
export function handleGenericError(
  error: unknown,
  context?: string
): ErrorResponse {
  const message = error instanceof Error ? error.message : "Unknown error";

  return {
    error: context || "Errore del server",
    message,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Create error response with appropriate status code
 * @param error Error object
 * @param statusCode HTTP status code
 * @returns NextResponse with error
 */
export function createErrorResponse(
  error: ErrorResponse,
  statusCode: number = 500
): NextResponse {
  return NextResponse.json(error, { status: statusCode });
}

/**
 * Log error for monitoring
 * @param error Error instance
 * @param context Context information
 */
export function logError(error: unknown, context: string): void {
  const timestamp = new Date().toISOString();
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  console.error(
    JSON.stringify({
      timestamp,
      context,
      message,
      stack,
    })
  );

  // In production, send to monitoring service
  // Example: sendToSentry(error, context);
}

/**
 * Common error responses
 */
export const CommonErrors = {
  UNAUTHORIZED: {
    error: "Non autorizzato",
    message: "Token mancante o non valido",
    timestamp: new Date().toISOString(),
  },
  FORBIDDEN: {
    error: "Accesso negato",
    message: "Permessi insufficienti",
    timestamp: new Date().toISOString(),
  },
  NOT_FOUND: {
    error: "Risorsa non trovata",
    timestamp: new Date().toISOString(),
  },
  BAD_REQUEST: {
    error: "Richiesta non valida",
    timestamp: new Date().toISOString(),
  },
  INTERNAL_ERROR: {
    error: "Errore interno del server",
    timestamp: new Date().toISOString(),
  },
  RATE_LIMIT_EXCEEDED: {
    error: "Troppi tentativi",
    message: "Attendi prima di riprovare",
    timestamp: new Date().toISOString(),
  },
};
