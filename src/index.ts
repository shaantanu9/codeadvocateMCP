/**
 * Main Entry Point
 *
 * This is the main entry point for the MCP server application.
 * It initializes and starts the HTTP server using configuration from .env file.
 *
 * Required environment variables:
 * - PORT: Server port (default: 3111)
 * - NODE_ENV: Environment (development, production, test)
 *
 * Optional environment variables:
 * - MCP_SERVER_TOKEN: Authentication token for MCP server
 * - EXTERNAL_API_URL: External API base URL
 * - OPENAI_API_KEY: OpenAI API key (if using OpenAI tools)
 * - ANTHROPIC_API_KEY: Anthropic API key (if using Anthropic tools)
 */

import { startServer } from "./server/index.js";
import { envConfig } from "./config/env.js";

// Log configuration on startup
console.log("[MCP] Starting server...");
console.log(`[MCP] Configuration loaded from .env`);
console.log(`[MCP] Port: ${envConfig.port}`);
console.log(`[MCP] Environment: ${envConfig.nodeEnv}`);

// Start the server
// The server will use PORT from envConfig (validated from .env file)
startServer();
