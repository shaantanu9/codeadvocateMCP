/**
 * MCP Server Factory
 *
 * Creates and configures MCP server instances with all registered tools.
 * Uses stateless mode: creates a new server for each request to avoid
 * connection conflicts (a server can only be connected to one transport at a time).
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerAllTools } from "../tools/tool-registry.js";
import { registerResources } from "./resources.js";
import { registerPrompts } from "./prompts.js";

/**
 * Creates a new MCP server instance with all tools, resources, and prompts registered.
 *
 * @returns Configured McpServer instance
 */
export function createMcpServer(): McpServer {
  const server = new McpServer({
    name: "codeadvocate-mcp",
    version: "1.0.0",
    description:
      "CodeAdvocate MCP server — manage code snippets, repositories, documentation, and personal knowledge. Provides tools for actions, resources for read-only context, and prompts for common workflows.",
  });

  // Register all three MCP primitives
  registerAllTools(server);   // Tools: actions with side effects
  registerResources(server);  // Resources: read-only data for LLM context
  registerPrompts(server);    // Prompts: reusable workflow templates

  return server;
}
