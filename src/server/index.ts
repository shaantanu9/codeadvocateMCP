/**
 * Server Startup
 *
 * Initializes and starts the HTTP server with graceful shutdown handling.
 */

import { Server } from "http";
import { createApp } from "./app.js";
import { envConfig } from "../config/env.js";
import { wellnessScheduler } from "../core/wellness-scheduler.js";
import * as WellnessTools from "../tools/wellness/index.js";
import { initializeMcpServer } from "../core/initializer.js";

/**
 * Starts the HTTP server
 * Uses PORT from validated environment configuration (.env file)
 */
export function startServer(): Server {
  // Initialize MCP server (creates .cursorrules, cache directories, etc.)
  initializeMcpServer();

  const app = createApp();
  const PORT = envConfig.port;

  const server = app.listen(PORT, () => {
    console.log(`[MCP] Server running at http://localhost:${PORT}/mcp`);
    console.log(`[MCP] Health check: http://localhost:${PORT}/health`);
    console.log(`[MCP] Ready to accept connections`);
    console.log(`[MCP] Protocol: Streamable HTTP (2025-03-26)`);
    console.log(`[MCP] Environment: ${envConfig.nodeEnv}`);
    console.log(`[MCP] Port: ${PORT} (from .env)`);
  });

  // Start wellness scheduler
  wellnessScheduler.setBreakReminderTool(WellnessTools.breakReminderTool);
  wellnessScheduler.start();
  console.log(
    `[Wellness] Scheduler started (interval: ${
      wellnessScheduler.getStatus().checkInterval / 1000 / 60
    } minutes)`
  );

  // Graceful shutdown handlers
  setupGracefulShutdown(server);

  return server;
}

/**
 * Track in-flight requests for graceful shutdown
 */
let inFlightRequests = 0;
let isShuttingDown = false;

/**
 * Sets up graceful shutdown handlers for the server
 * Tracks in-flight requests and waits for them to complete
 */
function setupGracefulShutdown(server: Server) {
  // Track request lifecycle
  server.on("request", () => {
    if (!isShuttingDown) {
      inFlightRequests++;
    }
  });

  const shutdown = async (signal: string) => {
    if (isShuttingDown) {
      console.log("[Server] Shutdown already in progress, forcing exit...");
      process.exit(1);
      return;
    }

    isShuttingDown = true;
    console.log(`\n[Server] Received ${signal}, shutting down gracefully...`);
    console.log(`[Server] In-flight requests: ${inFlightRequests}`);

    // Stop accepting new connections
    server.close(() => {
      console.log("[Server] HTTP server closed (no longer accepting connections)");
    });

    // Stop wellness scheduler
    wellnessScheduler.stop();
    console.log("[Server] Wellness scheduler stopped");

    // Wait for in-flight requests to complete
    const maxWaitTime = 10000; // 10 seconds
    const checkInterval = 100; // Check every 100ms
    const startTime = Date.now();

    const waitForRequests = () => {
      return new Promise<void>((resolve) => {
        const checkRequests = () => {
          if (inFlightRequests === 0) {
            console.log("[Server] All requests completed");
            resolve();
            return;
          }

          const elapsed = Date.now() - startTime;
          if (elapsed >= maxWaitTime) {
            console.warn(
              `[Server] Timeout waiting for requests. ${inFlightRequests} requests still in flight`
            );
            resolve();
            return;
          }

          setTimeout(checkRequests, checkInterval);
        };

        checkRequests();
      });
    };

    await waitForRequests();

    console.log("[Server] Graceful shutdown complete");
    process.exit(0);
  };

  // Helper to decrement in-flight requests when response is sent
  const originalEmit = server.emit.bind(server);
  server.emit = function (event: string, ...args: unknown[]) {
    if (event === "request" && args[1]) {
      const res = args[1] as { end?: () => void; once?: (event: string, fn: () => void) => void };
      if (res.once && typeof res.once === "function") {
        res.once("finish", () => {
          if (inFlightRequests > 0) {
            inFlightRequests--;
          }
        });
      }
    }
    return originalEmit(event, ...args);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  // Handle unhandled promise rejections
  process.on("unhandledRejection", (reason: unknown) => {
    console.error("[MCP] Unhandled Promise Rejection:", reason);
  });

  // Handle uncaught exceptions
  process.on("uncaughtException", (error: Error) => {
    console.error("[MCP] Uncaught Exception:", error);
    process.exit(1);
  });
}
