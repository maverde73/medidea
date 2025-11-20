/**
 * Cloudflare environment bindings type declarations
 * Extends the global CloudflareEnv interface from @opennextjs/cloudflare
 * to include our D1 database, R2 storage, and environment variables
 */

declare global {
  interface CloudflareEnv {
    // D1 Database binding (configured in wrangler.toml)
    DB: D1Database;

    // R2 Storage binding (configured in wrangler.toml)
    STORAGE: R2Bucket;

    // Environment variables
    JWT_SECRET: string;
    API_BASE_URL: string;
  }
}

export {};
