/**
 * Simple in-memory rate limiter for API routes.
 * For production at scale, replace with Redis-based solution.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup expired entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now > entry.resetAt) store.delete(key);
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitConfig {
  /** Max requests allowed in the window */
  maxRequests: number;
  /** Window duration in seconds */
  windowSeconds: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Check rate limit for a given key (typically IP or userId).
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;

  let entry = store.get(key);

  // If no entry or window expired, create new
  if (!entry || now > entry.resetAt) {
    entry = { count: 1, resetAt: now + windowMs };
    store.set(key, entry);
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt: entry.resetAt,
    };
  }

  // Increment count
  entry.count++;

  if (entry.count > config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }

  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Get client identifier from request (IP or fallback)
 */
export function getClientId(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;

  return "unknown";
}

// ─── Preset Configs ─────────────────────────────────────────

/** General API: 60 requests per minute */
export const API_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 60,
  windowSeconds: 60,
};

/** Auth routes (login/register): 10 per minute */
export const AUTH_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 10,
  windowSeconds: 60,
};

/** Strict: 5 per minute (password change, delete) */
export const STRICT_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 5,
  windowSeconds: 60,
};
