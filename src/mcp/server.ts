/**
 * MCP Server Factory
 *
 * Creates and configures MCP server instances with all registered tools.
 * Uses stateless mode: creates a new server for each request to avoid
 * connection conflicts (a server can only be connected to one transport at a time).
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerAllTools } from "../tools/tool-registry.js";

/**
 * Creates a new MCP server instance with all tools registered.
 *
 * @returns Configured McpServer instance
 */
export function createMcpServer(): McpServer {
  const server = new McpServer({
    name: "demo-mcp-server",
    version: "1.0.0",
    description:
      "MCP server for external API integration with token-based authentication. Provides tools to interact with code snippets, projects, and collections from an external API.",
    // Add server metadata that will appear in MCP dashboard
    // Note: The SDK may expose this through serverInfo in initialize response
  });

  // Register all tools using the scalable pattern
  // Tools are organized by category in src/tools/
  registerAllTools(server);

  return server;
}
