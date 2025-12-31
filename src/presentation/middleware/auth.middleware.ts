/**
 * Authentication Middleware
 *
 * Verifies authentication token via external API
 * Returns properly formatted JSON-RPC 2.0 errors that will show in MCP dashboard
 */

import { Request, Response, NextFunction } from "express";
import { getContext } from "../../core/context.js";
import { verifyToken } from "../../services/token-verification-service.js";
import { AuthenticationError } from "../../core/errors.js";
import { logger } from "../../core/logger.js";
import { envConfig } from "../../config/env.js";

/**
 * Authentication middleware
 * Verifies token via external API endpoint
 * Returns JSON-RPC 2.0 compliant errors for MCP dashboard visibility
 */
export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const context = getContext();

  // Extract request ID from body or query for proper error response
  const requestId = req.body?.id || req.query?.id || null;

  if (!context || !context.token || context.token.trim() === "") {
    logger.warn("Authentication failed: No token in context", {
      ip: req.ip,
      path: req.path,
      method: req.method,
    });

    // Set proper headers for JSON-RPC response
    res.status(401);
    res.setHeader("Content-Type", "application/json");

    res.json({
      jsonrpc: "2.0",
      error: {
        code: -32001,
        message: "Unauthorized: MCP server requires authentication token",
        data: {
          hint: "Provide a valid token in the Authorization header: 'Authorization: Bearer <token>'",
          path: req.path,
          method: req.method,
          tokenAcquisitionUrl: envConfig.tokenAcquisitionUrl,
          setupInstructions: {
            step1: `Visit ${envConfig.tokenAcquisitionUrl} to get your API key`,
            step2: "Add the token to your MCP configuration in Cursor",
            step3: "Restart Cursor IDE to apply changes",
            configLocation: "~/.cursor/mcp.json",
          },
        },
      },
      id: requestId,
    });
    return;
  }

  try {
    // Verify token via external API
    const verification = await verifyToken(context.token);

    if (!verification.valid) {
      logger.warn("Authentication failed: Invalid token", {
        ip: context.ip,
        requestId: context.requestId,
        reason: verification.message,
        path: req.path,
      });

      // Set proper headers for JSON-RPC response
      res.status(401);
      res.setHeader("Content-Type", "application/json");

      // Extract detailed error message from verification
      let errorMessage = "Invalid authentication token";
      if (verification.message) {
        errorMessage = verification.message.includes("401")
          ? "The provided API key is invalid, expired, or revoked"
          : verification.message;
      }

      res.json({
        jsonrpc: "2.0",
        error: {
          code: -32001,
          message: `Unauthorized: ${errorMessage}`,
          data: {
            reason: verification.message || "Token verification failed",
            hint: "Check that your token is valid and not expired",
            path: req.path,
            tokenAcquisitionUrl: envConfig.tokenAcquisitionUrl,
            setupInstructions: {
              step1: `Visit ${envConfig.tokenAcquisitionUrl} to get your API key`,
              step2: "Add the token to your MCP configuration in Cursor",
              step3: "Restart Cursor IDE to apply changes",
            },
          },
        },
        id: requestId,
      });
      return;
    }

    logger.info("Authentication successful", {
      ip: context.ip,
      requestId: context.requestId,
    });

    next();
  } catch (error) {
    logger.error("Authentication error", error, {
      ip: context?.ip,
      requestId: context?.requestId,
      path: req.path,
    });

    // Set proper headers for JSON-RPC response
    res.status(500);
    res.setHeader("Content-Type", "application/json");

    const errorMessage =
      error instanceof AuthenticationError
        ? error.message
        : error instanceof Error
        ? error.message
        : "Internal error during authentication";

    res.json({
      jsonrpc: "2.0",
      error: {
        code: -32603,
        message: errorMessage,
        data: {
          type: "InternalError",
          path: req.path,
        },
      },
      id: requestId,
    });
  }
}
