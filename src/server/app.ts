/**
 * Express Application Setup
 * 
 * Configures and sets up the Express application with all middleware,
 * routes, and error handlers.
 */

import express, { Request, Response, NextFunction } from "express";
import { envConfig } from "../config/env.js";
import { contextMiddleware } from "../presentation/middleware/context.middleware.js";
import { authMiddleware } from "../presentation/middleware/auth.middleware.js";
import { rateLimitMiddleware } from "../middleware/rate-limit.middleware.js";
import { handleMcpRequest } from "../mcp/transport.js";
import { logger } from "../core/logger.js";
import { AppError } from "../core/errors.js";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { readFileSync } from "node:fs";
import {
  getActivityStats,
  getAllActivityStats,
  getBreakStatus,
} from "./activity-endpoints.js";

/**
 * Creates and configures the Express application
 * 
 * @returns Configured Express application
 */
export function createApp() {
  const app = express();

  // Body parser middleware
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // CORS middleware for browser clients
  // The Mcp-Session-Id header must be exposed for browser clients to access it
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
    res.header(
      "Access-Control-Allow-Headers",
      "Content-Type, Accept, mcp-session-id, mcp-protocol-version, Authorization"
    );
    res.header("Access-Control-Expose-Headers", "Mcp-Session-Id");
    res.header("Access-Control-Max-Age", "86400"); // 24 hours

    if (req.method === "OPTIONS") {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // Input sanitization (early, before processing)
  app.use(inputSanitizationMiddleware);

  // Request context middleware (must be early to provide context to other middleware)
  app.use(contextMiddleware);

  // Request timeout middleware (for long-running requests)
  app.use(requestTimeoutMiddleware);

  // Request logging middleware with client detection
  app.use((req: Request, _res: Response, next: NextFunction) => {
    const userAgent = req.get("user-agent");
    logger.info(`HTTP ${req.method} ${req.path}`, {
      ip: req.ip,
      userAgent: userAgent?.substring(0, 50),
      // Client detection will be logged in context middleware
    });
    next();
  });

  // Health check endpoint - NO AUTH REQUIRED (to confirm MCP is working)
  app.get("/health", async (_req: Request, res: Response) => {
    const checks: Record<string, unknown> = {
      server: {
        name: "demo-mcp-server",
        version: "1.0.0",
        protocol: "Streamable HTTP",
        uptime: process.uptime(),
      },
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString(),
    };

    // Check external API health (non-blocking, timeout after 3 seconds)
    try {
      const externalApiCheck = await Promise.race([
        checkExternalApiHealth(),
        new Promise<{ available: boolean; latency?: number }>((resolve) =>
          setTimeout(() => resolve({ available: false }), 3000)
        ),
      ]);
      checks.externalApi = externalApiCheck;
    } catch (error) {
      checks.externalApi = {
        available: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }

    // Determine overall status
    const externalApiAvailable =
      checks.externalApi &&
      typeof checks.externalApi === "object" &&
      "available" in checks.externalApi &&
      checks.externalApi.available === true;

    const status = externalApiAvailable ? "healthy" : "degraded";
    const statusCode = status === "healthy" ? 200 : 503;

    res.status(statusCode).json({
      status,
      checks,
      note: "This endpoint works without authentication to confirm MCP server is running",
    });
  });

  /**
   * Check external API health by making a lightweight request
   */
  async function checkExternalApiHealth(): Promise<{
    available: boolean;
    latency?: number;
  }> {
    const startTime = Date.now();
    try {
      // Try to make a simple request to the external API
      // Use a lightweight endpoint or just check connectivity
      const response = await fetch(envConfig.externalApiUrl, {
        method: "HEAD",
        signal: AbortSignal.timeout(3000), // 3 second timeout
      });

      const latency = Date.now() - startTime;
      return {
        available: response.ok || response.status < 500,
        latency,
      };
    } catch (error) {
      const latency = Date.now() - startTime;
      return {
        available: false,
        latency,
      };
    }
  }

  // Activity tracking endpoints (require authentication via context)
  app.get("/api/activity/stats", getActivityStats);
  app.get("/api/activity/all", getAllActivityStats);
  app.get("/api/activity/break-status", getBreakStatus);

  // Root endpoint
  app.get("/", (_req: Request, res: Response) => {
    res.status(200).json({
      name: "demo-mcp-server",
      version: "1.0.0",
      description: "MCP server for external API integration with token-based authentication",
      endpoints: {
        health: "/health",
        mcp: "/mcp",
        tokenInfo: "/token-info",
        tokenSetup: "/token-setup",
      },
      protocol: "MCP Streamable HTTP",
      protocolVersion: "2025-03-26",
      authentication: {
        required: true,
        type: "Bearer Token",
        tokenAcquisitionUrl: envConfig.tokenAcquisitionUrl,
        instructions: "Get your API key from the external API and use it as the Bearer token in the Authorization header",
      },
    });
  });

  // Serve token setup HTML page (NO AUTH REQUIRED)
  app.get("/token-setup", (_req: Request, res: Response) => {
    try {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);
      const htmlPath = join(__dirname, "../../public/token-setup.html");
      const html = readFileSync(htmlPath, "utf-8");
      res.setHeader("Content-Type", "text/html");
      res.send(html);
    } catch (error) {
      logger.error("Error serving token setup page", error);
      res.status(500).json({
        error: "Failed to load token setup page",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Token info endpoint - provides setup instructions (NO AUTH REQUIRED)
  app.get("/token-info", (_req: Request, res: Response) => {
    res.status(200).json({
      name: "Token Setup Information",
      description: "How to get and configure your authentication token",
      tokenAcquisitionUrl: envConfig.tokenAcquisitionUrl,
      steps: [
        {
          step: 1,
          title: "Get Your API Key",
          description: "Visit the token acquisition URL to get your API key",
          action: {
            type: "open_url",
            url: envConfig.tokenAcquisitionUrl,
            label: "Open Token Acquisition Page",
          },
        },
        {
          step: 2,
          title: "Configure in Cursor",
          description: "Add the token to your MCP server configuration",
          action: {
            type: "configure",
            location: "~/.cursor/mcp.json",
            format: {
              url: `http://localhost:${envConfig.port}/mcp`,
              transport: "sse",
              headers: {
                Authorization: "Bearer YOUR_TOKEN_HERE",
              },
            },
          },
        },
        {
          step: 3,
          title: "Restart Cursor",
          description: "Restart Cursor IDE to apply the new configuration",
        },
      ],
      externalApiUrl: envConfig.externalApiUrl,
      verificationEndpoint: `${envConfig.externalApiBaseUrl}api-keys/verify`,
    });
  });

  // Handle OPTIONS for CORS preflight
  app.options("/mcp", (_req: Request, res: Response) => {
    res.status(204).end();
  });

  // Rate limiting for MCP endpoint (applied before authentication)
  app.use("/mcp", rateLimitMiddleware);

  // MCP endpoint - handle both GET (streaming) and POST (JSON-RPC)
  // Protected with authentication middleware
  // Wrap async middleware to handle errors
  const asyncAuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
    authMiddleware(req, res, next).catch((err) => {
      logger.error("Auth middleware error", err);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: "2.0",
          error: {
            code: -32603,
            message: "Internal error during authentication",
          },
          id: req.body?.id || null,
        });
      }
    });
  };

  app.get("/mcp", asyncAuthMiddleware, handleMcpRequest);
  app.post("/mcp", asyncAuthMiddleware, handleMcpRequest);

  // DELETE endpoint for session cleanup (optional)
  app.delete("/mcp", async (_req: Request, res: Response) => {
    logger.info("DELETE request received - session cleanup");
    res.status(200).json({
      jsonrpc: "2.0",
      result: { message: "Session cleanup acknowledged" },
      id: null,
    });
  });

  // 404 handler
  app.use((_req: Request, res: Response) => {
    res.status(404).json({
      error: "Not Found",
      message: "The requested endpoint does not exist",
      availableEndpoints: ["/", "/health", "/mcp"],
    });
  });

  // Global error handler
  app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
    logger.error("Unhandled error", err, {
      path: req.path,
      method: req.method,
    });

    const statusCode = err instanceof AppError ? err.statusCode : 500;
    const message =
      process.env.NODE_ENV === "production" && !(err instanceof AppError)
        ? "An error occurred"
        : err.message;

    res.status(statusCode).json({
      error: "Internal Server Error",
      message,
      ...(process.env.NODE_ENV !== "production" && {
        stack: err.stack,
      }),
    });
  });

  return app;
}

