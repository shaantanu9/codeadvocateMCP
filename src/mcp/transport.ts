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

  try {
    // Create a new server instance for this request
    server = createMcpServer();

    // Create transport in stateless mode (no session management)
    transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined, // Stateless mode
    });

    // Cleanup function to close transport and server
    const cleanup = () => {
      try {
        if (transport) {
          transport.close();
        }
        if (server) {
          server.close();
        }
      } catch (error) {
        console.error("[MCP] Error during cleanup:", error);
      }
    };

    // Set up cleanup handlers
    res.on("close", cleanup);
    res.on("error", (error) => {
      console.error("[MCP] Response error:", error);
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
  } catch (error) {
    console.error("[MCP] Error handling request:", error);

    // Cleanup on error
    if (transport) {
      try {
        transport.close();
      } catch (e) {
        console.error("[MCP] Error closing transport:", e);
      }
    }
    if (server) {
      try {
        server.close();
      } catch (e) {
        console.error("[MCP] Error closing server:", e);
      }
    }

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




