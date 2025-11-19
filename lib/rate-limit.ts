/**
 * Rate limiting utilities
 */

/**
 * Simple in-memory rate limiter for development
 * In production, use Cloudflare Workers KV or Durable Objects
 */
class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  /**
   * Check if request should be rate limited
   * @param identifier Unique identifier (IP, user ID, etc.)
   * @param maxRequests Maximum requests allowed
   * @param windowMs Time window in milliseconds
   * @returns Object with allowed status and remaining requests
   */
  check(
    identifier: string,
    maxRequests: number,
    windowMs: number
  ): { allowed: boolean; remaining: number; resetAt: number } {
    const now = Date.now();
    const windowStart = now - windowMs;

    // Get existing requests for this identifier
    let requests = this.requests.get(identifier) || [];

    // Filter out old requests
    requests = requests.filter((timestamp) => timestamp > windowStart);

    // Check if limit exceeded
    const allowed = requests.length < maxRequests;
    const remaining = Math.max(0, maxRequests - requests.length - 1);
    const resetAt = now + windowMs;

    if (allowed) {
      // Add current request
      requests.push(now);
      this.requests.set(identifier, requests);
    }

    return { allowed, remaining, resetAt };
  }

  /**
   * Clear all rate limit data (for testing)
   */
  clear() {
    this.requests.clear();
  }
}

// Global rate limiter instance
export const rateLimiter = new RateLimiter();

/**
 * Rate limit configurations
 */
export const RATE_LIMITS = {
  // Login endpoint: 5 requests per 15 minutes
  login: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000,
  },
  // Upload endpoint: 10 requests per hour
  upload: {
    maxRequests: 10,
    windowMs: 60 * 60 * 1000,
  },
  // General API: 100 requests per minute
  api: {
    maxRequests: 100,
    windowMs: 60 * 1000,
  },
};

/**
 * Get identifier for rate limiting
 * @param request Request object
 * @param userId Optional user ID for authenticated requests
 * @returns Unique identifier
 */
export function getRateLimitIdentifier(
  ip: string | null,
  userId?: number
): string {
  // Use user ID if authenticated, otherwise use IP
  if (userId) {
    return `user:${userId}`;
  }
  return `ip:${ip || "unknown"}`;
}
