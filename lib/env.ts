/**
 * Environment configuration and type definitions
 * for Cloudflare Workers bindings
 */

export interface Env {
  // D1 Database binding
  DB: D1Database;

  // R2 Storage binding
  STORAGE: R2Bucket;

  // Environment variables
  JWT_SECRET: string;
  API_BASE_URL: string;
}

/**
 * Get environment variables with type safety
 */
export function getEnv(): Env {
  // In Cloudflare Workers, env is passed via context
  // This helper is for type safety
  return {} as Env;
}
