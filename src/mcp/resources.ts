/**
 * MCP Resources Registration
 *
 * Resources expose read-only data that MCP clients can surface to LLMs
 * without requiring a tool call. This gives the LLM immediate context.
 *
 * URI scheme: codeadvocate://...
 */

import { ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createExternalApiService } from "../application/services/external-api.service.js";
import { logger } from "../core/logger.js";

/**
 * Register all MCP resources with the server
 */
export function registerResources(server: McpServer): void {
  // 1. Current user profile — LLM always needs to know who it's helping
  server.resource(
    "user-profile",
    "codeadvocate://user/profile",
    {
      description: "Current authenticated user's profile (name, email, role, account type)",
      mimeType: "application/json",
    },
    async (uri) => {
      try {
        const api = createExternalApiService();
        const profile = await api.get("/api/auth/me");
        return {
          contents: [{
            uri: uri.href,
            text: JSON.stringify(profile, null, 2),
            mimeType: "application/json",
          }],
        };
      } catch (error) {
        logger.error("Failed to fetch user profile resource", error);
        return {
          contents: [{
            uri: uri.href,
            text: JSON.stringify({ error: "Failed to fetch user profile" }),
            mimeType: "application/json",
          }],
        };
      }
    }
  );

  // 2. Dashboard stats — overview of user's activity
  server.resource(
    "dashboard-stats",
    "codeadvocate://dashboard/stats",
    {
      description: "User's dashboard statistics: snippet count, recent activity, storage usage",
      mimeType: "application/json",
    },
    async (uri) => {
      try {
        const api = createExternalApiService();
        const stats = await api.get("/api/dashboard/stats");
        return {
          contents: [{
            uri: uri.href,
            text: JSON.stringify(stats, null, 2),
            mimeType: "application/json",
          }],
        };
      } catch (error) {
        logger.error("Failed to fetch dashboard stats resource", error);
        return {
          contents: [{
            uri: uri.href,
            text: JSON.stringify({ error: "Failed to fetch dashboard stats" }),
            mimeType: "application/json",
          }],
        };
      }
    }
  );

  // 3. Individual snippet by ID — parameterized resource
  server.resource(
    "snippet",
    new ResourceTemplate("codeadvocate://snippets/{id}", { list: undefined }),
    {
      description: "A code snippet by ID — includes title, code, language, tags, and metadata",
      mimeType: "application/json",
    },
    async (uri, params) => {
      try {
        const api = createExternalApiService();
        const snippet = await api.get(`/api/snippets/${params.id}`);
        return {
          contents: [{
            uri: uri.href,
            text: JSON.stringify(snippet, null, 2),
            mimeType: "application/json",
          }],
        };
      } catch (error) {
        logger.error(`Failed to fetch snippet resource ${params.id}`, error);
        return {
          contents: [{
            uri: uri.href,
            text: JSON.stringify({ error: `Snippet ${params.id} not found` }),
            mimeType: "application/json",
          }],
        };
      }
    }
  );

  // 4. Repository context — rules, docs, patterns for a repo
  server.resource(
    "repo-context",
    new ResourceTemplate("codeadvocate://repos/{id}/context", { list: undefined }),
    {
      description: "Repository MCP context: rules, documentation, patterns, and learnings. Essential context for working within a repository.",
      mimeType: "application/json",
    },
    async (uri, params) => {
      try {
        const api = createExternalApiService();
        const context = await api.get(`/api/repositories/${params.id}/mcp-context`);
        return {
          contents: [{
            uri: uri.href,
            text: JSON.stringify(context, null, 2),
            mimeType: "application/json",
          }],
        };
      } catch (error) {
        logger.error(`Failed to fetch repo context resource ${params.id}`, error);
        return {
          contents: [{
            uri: uri.href,
            text: JSON.stringify({ error: `Repository context for ${params.id} not found` }),
            mimeType: "application/json",
          }],
        };
      }
    }
  );

  // 5. Repository rules — coding rules for a specific repo
  server.resource(
    "repo-rules",
    new ResourceTemplate("codeadvocate://repos/{id}/rules", { list: undefined }),
    {
      description: "Coding rules and guidelines defined for a repository. The LLM should follow these when writing code for this repo.",
      mimeType: "application/json",
    },
    async (uri, params) => {
      try {
        const api = createExternalApiService();
        const rules = await api.get(`/api/repositories/${params.id}/rules`);
        return {
          contents: [{
            uri: uri.href,
            text: JSON.stringify(rules, null, 2),
            mimeType: "application/json",
          }],
        };
      } catch (error) {
        logger.error(`Failed to fetch repo rules resource ${params.id}`, error);
        return {
          contents: [{
            uri: uri.href,
            text: JSON.stringify({ error: `Rules for repository ${params.id} not found` }),
            mimeType: "application/json",
          }],
        };
      }
    }
  );

  // 6. User preferences — how the user likes things
  server.resource(
    "user-preferences",
    "codeadvocate://user/preferences",
    {
      description: "User's preferences and settings (theme, editor config, notification preferences)",
      mimeType: "application/json",
    },
    async (uri) => {
      try {
        const api = createExternalApiService();
        const prefs = await api.get("/api/user/preferences");
        return {
          contents: [{
            uri: uri.href,
            text: JSON.stringify(prefs, null, 2),
            mimeType: "application/json",
          }],
        };
      } catch (error) {
        logger.error("Failed to fetch user preferences resource", error);
        return {
          contents: [{
            uri: uri.href,
            text: JSON.stringify({ error: "Failed to fetch user preferences" }),
            mimeType: "application/json",
          }],
        };
      }
    }
  );

  logger.info("Registered 6 MCP resources");
}
