import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../services/token-verification-service.js";
import {
  setRequestToken,
  clearRequestToken,
} from "../utils/request-context.js";

/**
 * Authentication middleware for MCP server
 * Verifies token via external API endpoint
 * 
 * SECURITY: API key verification is ALWAYS required.
 * NO BYPASSES - All requests must have valid token verification.
 */
export async function mcpAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  // Extract token from headers
  let token: string | undefined;

  // Try Authorization header first
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7); // Remove "Bearer " prefix
  }

  // Try X-MCP-Token header if Authorization not found
  if (!token) {
    token = req.headers["x-mcp-token"] as string | undefined;
  }

  // SECURITY: ALWAYS require token - NO BYPASSES
  // Check if token is provided
  if (!token) {
    console.warn(
      `[Auth] ❌ Unauthorized access attempt from ${req.ip} - No token provided`
    );
    res.status(401).json({
      jsonrpc: "2.0",
      error: {
        code: -32001,
        message: "Unauthorized: MCP server requires authentication token. API key verification is mandatory.",
      },
      id: req.body?.id || null,
    });
    return;
  }

  // SECURITY: ALWAYS verify token via external API - NO BYPASSES
  // Token verification is mandatory regardless of environment or API availability
  const verification = await verifyToken(token);

  if (!verification.valid) {
    console.warn(
      `[Auth] ❌ Unauthorized access attempt from ${req.ip} - Invalid token: ${verification.message}`
    );
    res.status(401).json({
      jsonrpc: "2.0",
      error: {
        code: -32001,
        message: `Unauthorized: ${
          verification.message || "Invalid authentication token"
        }`,
      },
      id: req.body?.id || null,
    });
    return;
  }

  // Token is valid, store in request context for tools to use
  setRequestToken(token);

  // Clear token when request completes
  res.on("finish", () => {
    clearRequestToken();
  });
  res.on("close", () => {
    clearRequestToken();
  });

  console.log(`[Auth] ✅ Authenticated request from ${req.ip}`);
  next();
}
