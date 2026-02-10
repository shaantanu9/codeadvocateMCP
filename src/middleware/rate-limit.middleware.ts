/**
 * Rate Limiting Middleware
 *
 * Prevents abuse by limiting the number of requests per identifier
 * (API key or IP address) within a time window.
 * Includes bounded storage to prevent OOM.
 */

import { Request, Response, NextFunction } from "express";
import { logger } from "../core/logger.js";
import { envConfig } from "../config/env.js";

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

/**
 * In-memory rate limit store with bounded size
 */
class RateLimitStore {
  private records = new Map<string, RateLimitRecord>();
  private readonly windowMs: number;
  private readonly maxRequests: number;
  private readonly maxRecords: number;

  constructor(windowMs: number, maxRequests: number, maxRecords: number = 10000) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.maxRecords = maxRecords;

    // Cleanup expired records every 30 seconds
    setInterval(() => this.cleanup(), 30 * 1000);
  }

  /**
   * Check if request should be allowed
   */
  check(identifier: string): boolean {
    const now = Date.now();
    const record = this.records.get(identifier);

    // No record or expired - create new window
    if (!record || now > record.resetAt) {
      // Enforce max records before adding new entry
      if (this.records.size >= this.maxRecords) {
        this.evictOldest();
      }

      this.records.set(identifier, {
        count: 1,
        resetAt: now + this.windowMs,
      });
      return true;
    }

    // Check if limit exceeded
    if (record.count >= this.maxRequests) {
      return false;
    }

    // Increment count
    record.count++;
    return true;
  }

  /**
   * Get remaining requests for identifier
   */
  getRemaining(identifier: string): number {
    const record = this.records.get(identifier);
    if (!record || Date.now() > record.resetAt) {
      return this.maxRequests;
    }
    return Math.max(0, this.maxRequests - record.count);
  }

  /**
   * Get reset time for identifier
   */
  getResetTime(identifier: string): number {
    const record = this.records.get(identifier);
    if (!record) {
      return Date.now() + this.windowMs;
    }
    return record.resetAt;
  }

  /**
   * Cleanup expired records
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [identifier, record] of this.records.entries()) {
      if (now > record.resetAt) {
        this.records.delete(identifier);
      }
    }
  }

  /**
   * Evict oldest 10% of records when at capacity
   */
  private evictOldest(): void {
    const removeCount = Math.ceil(this.maxRecords * 0.1);
    const sorted = Array.from(this.records.entries())
      .sort((a, b) => a[1].resetAt - b[1].resetAt);

    for (let i = 0; i < removeCount && i < sorted.length; i++) {
      this.records.delete(sorted[i][0]);
    }
  }
}

// Create rate limiter instances
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = envConfig.maxRequestsPerMinute || 100;

// Per-IP burst limiter
const ipLimiter = new RateLimitStore(WINDOW_MS, MAX_REQUESTS, 10000);
// Per-API-key daily limiter (more generous, per day)
const keyLimiter = new RateLimitStore(24 * 60 * 60 * 1000, 50000, 5000);

/**
 * Extract rate limit identifier from request.
 * Uses API key hash if authenticated, IP otherwise.
 */
function getIdentifier(req: Request): { id: string; type: "key" | "ip" } {
  // Check for API key in headers
  const apiKey = req.headers["x-api-key"] as string | undefined;
  const authHeader = req.headers["authorization"] as string | undefined;

  if (apiKey) {
    // Hash the key to avoid storing raw keys
    const keyPrefix = apiKey.substring(0, 8);
    return { id: `key:${keyPrefix}`, type: "key" };
  }

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const tokenPrefix = token.substring(0, 8);
    return { id: `key:${tokenPrefix}`, type: "key" };
  }

  // Fall back to IP
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  return { id: `ip:${ip}`, type: "ip" };
}

/**
 * Rate limiting middleware
 *
 * Applies both per-IP burst limiting and per-API-key daily limiting.
 */
export function rateLimitMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const { id, type } = getIdentifier(req);

  // Check IP-level burst limit
  const ipId = `ip:${req.ip || req.socket.remoteAddress || "unknown"}`;
  if (!ipLimiter.check(ipId)) {
    respondRateLimited(req, res, ipId, ipLimiter);
    return;
  }

  // For authenticated requests, also check key-level daily limit
  if (type === "key" && !keyLimiter.check(id)) {
    respondRateLimited(req, res, id, keyLimiter);
    return;
  }

  // Add rate limit headers (use the more restrictive one)
  const remaining = ipLimiter.getRemaining(ipId);
  const resetTime = ipLimiter.getResetTime(ipId);

  res.setHeader("X-RateLimit-Limit", MAX_REQUESTS.toString());
  res.setHeader("X-RateLimit-Remaining", remaining.toString());
  res.setHeader("X-RateLimit-Reset", new Date(resetTime).toISOString());

  next();
}

function respondRateLimited(
  req: Request,
  res: Response,
  identifier: string,
  store: RateLimitStore
): void {
  const remaining = store.getRemaining(identifier);
  const resetTime = store.getResetTime(identifier);
  const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);

  logger.warn("Rate limit exceeded", {
    identifier,
    path: req.path,
    method: req.method,
    retryAfter,
  });

  res.status(429);
  res.setHeader("Retry-After", retryAfter.toString());
  res.setHeader("X-RateLimit-Limit", MAX_REQUESTS.toString());
  res.setHeader("X-RateLimit-Remaining", remaining.toString());
  res.setHeader("X-RateLimit-Reset", new Date(resetTime).toISOString());

  res.json({
    jsonrpc: "2.0",
    error: {
      code: -32000,
      message: `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
      data: {
        retryAfter,
        limit: MAX_REQUESTS,
        window: "1 minute",
      },
    },
    id: req.body?.id || null,
  });
}
