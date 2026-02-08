/**
 * MCP Transport Handler
 * 
 * Handles StreamableHTTPServerTransport creation and request processing
 * for MCP protocol requests.
 */

import { Request, Response, NextFunction } from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpServer } from "./server.js";
import { envConfig } from "../config/env.js";
import { logger } from "../core/logger.js";

/**
 * Handles MCP protocol requests (both GET for streaming and POST for JSON-RPC).
 * Uses stateless mode: creates a new server and transport for each request
 * to ensure complete isolation and avoid request ID collisions.
 * 
 * @param req Express request object
 * @param res Express response object
 * @param next Express next function
 */
export async function handleMcpRequest(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  let transport: StreamableHTTPServerTransport | null = null;
  let server: McpServer | null = null;
  let timeoutId: NodeJS.Timeout | null = null;

  const cleanup = () => {
    try {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      if (transport) {
        transport.close();
        transport = null;
      }
      if (server) {
        server.close();
        server = null;
      }
    } catch (error) {
      logger.error("[MCP] Error during cleanup", error);
    }
  };

  try {
    // Set up timeout for the entire request
    timeoutId = setTimeout(() => {
      if (!res.headersSent) {
        logger.warn("MCP request timeout", {
          path: req.path,
          method: req.method,
          timeout: envConfig.mcpRequestTimeout,
        });
        res.status(504).json({
          jsonrpc: "2.0",
          error: {
            code: -32000,
            message: `Request timeout after ${envConfig.mcpRequestTimeout}ms`,
            data: {
              timeout: envConfig.mcpRequestTimeout,
              suggestion: "The operation took too long. Try breaking it into smaller parts.",
            },
          },
          id: req.body?.id || null,
        });
        cleanup();
      }
    }, envConfig.mcpRequestTimeout);

    // Create a new server instance for this request
    server = createMcpServer();

    // Create transport in stateless mode (no session management)
    transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined, // Stateless mode
    });

    // Set up cleanup handlers
    res.on("close", cleanup);
    res.on("finish", () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    });
    res.on("error", (error) => {
      logger.error("[MCP] Response error", error);
      cleanup();
    });

    // Connect server to transport
    await server.connect(transport);

    // Prepare request body
    // For GET requests, body might be empty - transport will handle it
    // For POST requests, body is in req.body
    const requestBody = req.method === "POST" ? req.body : undefined;

    // Handle the request through transport
    // The transport will handle both GET (streaming) and POST (JSON-RPC) requests
    await transport.handleRequest(req, res, requestBody);

    // Clear timeout on successful completion
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  } catch (error) {
    logger.error("[MCP] Error handling request", error);

    // Cleanup on error
    cleanup();

    // Send error response if headers not sent
    if (!res.headersSent) {
      const errorMessage =
        error instanceof Error ? error.message : "Internal server error";
      res.status(500).json({
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message: errorMessage,
        },
        id: req.body?.id || null,
      });
    } else {
      // If headers already sent, pass to Express error handler
      next(error);
    }
  }
}




