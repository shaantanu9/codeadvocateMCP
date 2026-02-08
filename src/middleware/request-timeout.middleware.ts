/**
 * Request Timeout Middleware
 * 
 * Adds timeout handling for long-running requests
 */

import { Request, Response, NextFunction } from "express";
import { envConfig } from "../config/env.js";
import { logger } from "../core/logger.js";

/**
 * Middleware to add timeout to requests
 * Cancels request if it exceeds the configured timeout
 */
export function requestTimeoutMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const timeout = envConfig.mcpRequestTimeout;
  const timeoutId = setTimeout(() => {
    if (!res.headersSent) {
      logger.warn("Request timeout", {
        path: req.path,
        method: req.method,
        timeout,
        requestId: req.headers["x-request-id"],
      });

      res.status(504).json({
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message: `Request timeout after ${timeout}ms. The operation took too long to complete.`,
          data: {
            timeout,
            timeoutSeconds: Math.round(timeout / 1000),
            suggestion: "Try breaking the operation into smaller parts or check if the external API is responding.",
          },
        },
        id: req.body?.id || null,
      });
    }
  }, timeout);

  // Clear timeout when response is sent
  res.on("finish", () => {
    clearTimeout(timeoutId);
  });

  res.on("close", () => {
    clearTimeout(timeoutId);
  });

  next();
}
