/**
 * Rate Limiting Middleware
 * 
 * Prevents abuse by limiting the number of requests per IP address
 * within a time window.
 */

import { Request, Response, NextFunction } from "express";
import { logger } from "../core/logger.js";
import { envConfig } from "../config/env.js";

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

/**
 * In-memory rate limit store
 * In production, consider using Redis for distributed rate limiting
 */
class RateLimitStore {
  private records = new Map<string, RateLimitRecord>();
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs: number, maxRequests: number) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    
    // Cleanup expired records every minute
    setInterval(() => this.cleanup(), 60 * 1000);
  }

  /**
   * Check if request should be allowed
   */
  check(identifier: string): boolean {
    const now = Date.now();
    const record = this.records.get(identifier);

    // No record or expired - create new window
    if (!record || now > record.resetAt) {
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
}

// Create rate limiter instance
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = envConfig.maxRequestsPerMinute || 100;

const rateLimitStore = new RateLimitStore(WINDOW_MS, MAX_REQUESTS);

/**
 * Rate limiting middleware
 * 
 * Limits requests per IP address within a time window
 */
export function rateLimitMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const identifier = req.ip || req.socket.remoteAddress || "unknown";

  if (!rateLimitStore.check(identifier)) {
    const remaining = rateLimitStore.getRemaining(identifier);
    const resetTime = rateLimitStore.getResetTime(identifier);
    const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);

    logger.warn("Rate limit exceeded", {
      ip: identifier,
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
        message: `Rate limit exceeded. Maximum ${MAX_REQUESTS} requests per minute. Please try again in ${retryAfter} seconds.`,
        data: {
          retryAfter,
          limit: MAX_REQUESTS,
          window: "1 minute",
        },
      },
      id: req.body?.id || null,
    });
    return;
  }

  // Add rate limit headers to successful requests
  const remaining = rateLimitStore.getRemaining(identifier);
  const resetTime = rateLimitStore.getResetTime(identifier);
  
  res.setHeader("X-RateLimit-Limit", MAX_REQUESTS.toString());
  res.setHeader("X-RateLimit-Remaining", remaining.toString());
  res.setHeader("X-RateLimit-Reset", new Date(resetTime).toISOString());

  next();
}



