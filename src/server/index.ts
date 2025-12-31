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

/**
 * Starts the HTTP server
 * Uses PORT from validated environment configuration (.env file)
 */
export function startServer(): Server {
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
 * Sets up graceful shutdown handlers for the server
 */
function setupGracefulShutdown(server: Server) {
  const shutdown = (signal: string) => {
    console.log(`\n[Server] Received ${signal}, shutting down gracefully...`);

    // Stop wellness scheduler
    wellnessScheduler.stop();

    server.close(() => {
      console.log("[Server] HTTP server closed");
      process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      console.error("[Server] Forced shutdown after timeout");
      process.exit(1);
    }, 10000);
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
