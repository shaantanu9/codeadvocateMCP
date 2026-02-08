/**
 * Input Sanitization Middleware
 * 
 * Sanitizes user inputs to prevent injection attacks
 */

import { Request, Response, NextFunction } from "express";
import { logger } from "../core/logger.js";

/**
 * Sanitize a string by removing potentially dangerous characters
 */
function sanitizeString(input: unknown): string {
  if (typeof input !== "string") {
    return String(input);
  }

  // Remove null bytes
  let sanitized = input.replace(/\0/g, "");

  // Remove control characters except newlines and tabs
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  // Limit length to prevent DoS
  const MAX_LENGTH = 100000; // 100KB
  if (sanitized.length > MAX_LENGTH) {
    sanitized = sanitized.substring(0, MAX_LENGTH);
  }

  return sanitized;
}

/**
 * Recursively sanitize an object
 */
function sanitizeObject(obj: unknown): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === "string") {
    return sanitizeString(obj);
  }

  if (typeof obj === "number" || typeof obj === "boolean") {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item));
  }

  if (typeof obj === "object") {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      // Sanitize key
      const sanitizedKey = sanitizeString(key);
      // Sanitize value
      sanitized[sanitizedKey] = sanitizeObject(value);
    }
    return sanitized;
  }

  return obj;
}

/**
 * Middleware to sanitize request inputs
 * 
 * Sanitizes:
 * - Request body
 * - Query parameters
 * - URL parameters
 */
export function inputSanitizationMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    // Sanitize body
    if (req.body && typeof req.body === "object") {
      req.body = sanitizeObject(req.body) as typeof req.body;
    }

    // Sanitize query parameters
    if (req.query) {
      req.query = sanitizeObject(req.query) as typeof req.query;
    }

    // Sanitize URL parameters
    if (req.params) {
      req.params = sanitizeObject(req.params) as typeof req.params;
    }

    next();
  } catch (error) {
    logger.error("Input sanitization failed", error);
    res.status(400).json({
      jsonrpc: "2.0",
      error: {
        code: -32602,
        message: "Invalid request parameters",
        data: {
          reason: "Input sanitization failed",
        },
      },
      id: req.body?.id || null,
    });
  }
}
