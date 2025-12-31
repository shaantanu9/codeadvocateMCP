import { z } from "zod";
import { createExternalApiService } from "../application/services/external-api.service.js";
import { textResponse, jsonResponse } from "../utils/response-formatter.js";
import { logger } from "../core/logger.js";
import { AppError } from "../core/errors.js";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

/**
 * Register external API tools on the MCP server
 */
export function registerExternalAPITools(server: McpServer): void {
  // NOTE: listSnippets has been migrated to the new scalable pattern
  // It's now registered via tool-registry.ts
  // Keeping the rest of the tools here until they're migrated

  // Tool: List snippets from external API - MIGRATED to list-snippets.tool.ts
  // server.tool("listSnippets", ...) - REMOVED, now in tool-registry

  // Tool: Get a specific snippet
  server.tool(
    "getSnippet",
    "Get a specific code snippet by ID",
    {
      snippetId: z.string().describe("The ID of the snippet to retrieve"),
    },
    async ({ snippetId }) => {
      try {
        logger.debug(`getSnippet called: ${snippetId}`);

        let apiService;
        try {
          apiService = createExternalApiService();
        } catch (error) {
          logger.error("Failed to create ExternalApiService", error);
          return textResponse(
            `❌ External API service is not available: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          );
        }

        const result = await apiService.get(`/api/snippets/${snippetId}`);

        return jsonResponse(result, `✅ Retrieved snippet: ${snippetId}`);
      } catch (error) {
        logger.error("getSnippet failed", error);
        const message =
          error instanceof AppError
            ? error.message
            : error instanceof Error
            ? error.message
            : "Failed to get snippet";
        return textResponse(`❌ Error: ${message}`);
      }
    }
  );

  // Tool: Create a new snippet
  server.tool(
    "createSnippet",
    "Create a new code snippet",
    {
      title: z.string().describe("Title of the snippet"),
      code: z.string().describe("The code content"),
      language: z.string().describe("Programming language"),
      description: z.string().optional().describe("Description of the snippet"),
      tags: z.array(z.string()).optional().describe("Tags for the snippet"),
      projectId: z.string().optional().describe("Associated project ID"),
      repositoryId: z.string().optional().describe("Associated repository ID"),
    },
    async ({
      title,
      code,
      language,
      description,
      tags,
      projectId,
      repositoryId,
    }) => {
      try {
        logger.debug(`createSnippet called: ${title}`);

        let apiService;
        try {
          apiService = createExternalApiService();
        } catch (error) {
          logger.error("Failed to create ExternalApiService", error);
          return textResponse(
            `❌ External API service is not available: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          );
        }

        const body: Record<string, unknown> = {
          title,
          code,
          language,
        };

        if (description) body.description = description;
        if (tags) body.tags = tags;
        if (projectId) body.projectId = projectId;
        if (repositoryId) body.repositoryId = repositoryId;

        const result = await apiService.post("/api/snippets", body);

        return jsonResponse(result, `✅ Created snippet: ${title}`);
      } catch (error) {
        logger.error("createSnippet failed", error);
        const message =
          error instanceof AppError
            ? error.message
            : error instanceof Error
            ? error.message
            : "Failed to create snippet";
        return textResponse(`❌ Error: ${message}`);
      }
    }
  );

  // Tool: List projects
  server.tool(
    "listProjects",
    "List projects from the external API",
    {
      search: z.string().optional().describe("Search term to filter projects"),
      teamId: z.string().optional().describe("Filter by team ID"),
      page: z.number().optional().default(1).describe("Page number"),
      limit: z.number().optional().default(20).describe("Items per page"),
    },
    async ({ search, teamId, page, limit }) => {
      try {
        logger.debug("listProjects called");

        let apiService;
        try {
          apiService = createExternalApiService();
        } catch (error) {
          logger.error("Failed to create ExternalApiService", error);
          return textResponse(
            `❌ External API service is not available: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          );
        }

        const queryParams: Record<string, string | number> = {};
        if (search) queryParams.search = search;
        if (teamId) queryParams.teamId = teamId;
        if (page) queryParams.page = page;
        if (limit) queryParams.limit = limit;

        const result = await apiService.get("/api/projects", queryParams);

        return jsonResponse(
          result,
          `✅ Retrieved projects (Page ${page || 1})`
        );
      } catch (error) {
        logger.error("listProjects failed", error);
        const message =
          error instanceof AppError
            ? error.message
            : error instanceof Error
            ? error.message
            : "Failed to list projects";
        return textResponse(`❌ Error: ${message}`);
      }
    }
  );

  // Tool: List collections
  server.tool(
    "listCollections",
    "List collections from the external API",
    {
      search: z.string().optional().describe("Search term"),
      page: z.number().optional().default(1),
      limit: z.number().optional().default(20),
    },
    async ({ search, page, limit }) => {
      try {
        logger.debug("listCollections called");

        let apiService;
        try {
          apiService = createExternalApiService();
        } catch (error) {
          logger.error("Failed to create ExternalApiService", error);
          return textResponse(
            `❌ External API service is not available: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          );
        }

        const queryParams: Record<string, string | number> = {};
        if (search) queryParams.search = search;
        if (page) queryParams.page = page;
        if (limit) queryParams.limit = limit;

        const result = await apiService.get("/api/collections", queryParams);

        return jsonResponse(result, `✅ Retrieved collections`);
      } catch (error) {
        logger.error("listCollections failed", error);
        const message =
          error instanceof AppError
            ? error.message
            : error instanceof Error
            ? error.message
            : "Failed to list collections";
        return textResponse(`❌ Error: ${message}`);
      }
    }
  );

  // Tool: Generic API call (for flexibility)
  server.tool(
    "callExternalAPI",
    "Make a generic API call to the external API",
    {
      method: z
        .enum(["GET", "POST", "PUT", "PATCH", "DELETE"])
        .describe("HTTP method"),
      endpoint: z
        .string()
        .describe("API endpoint (e.g., /api/snippets, /api/projects)"),
      body: z
        .record(z.unknown())
        .optional()
        .describe("Request body (for POST/PUT/PATCH)"),
      queryParams: z
        .record(z.union([z.string(), z.number(), z.boolean()]))
        .optional()
        .describe("Query parameters"),
    },
    async ({ method, endpoint, body, queryParams }) => {
      try {
        logger.debug(`callExternalAPI: ${method} ${endpoint}`);

        let apiService;
        try {
          apiService = createExternalApiService();
        } catch (error) {
          logger.error("Failed to create ExternalApiService", error);
          return textResponse(
            `❌ External API service is not available: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          );
        }

        let result;
        switch (method) {
          case "GET":
            result = await apiService.get(endpoint, queryParams);
            break;
          case "POST":
            result = await apiService.post(endpoint, body, queryParams);
            break;
          case "PUT":
            result = await apiService.put(endpoint, body, queryParams);
            break;
          case "PATCH":
            result = await apiService.patch(endpoint, body, queryParams);
            break;
          case "DELETE":
            result = await apiService.delete(endpoint, queryParams);
            break;
        }

        return jsonResponse(
          result,
          `✅ API call successful: ${method} ${endpoint}`
        );
      } catch (error) {
        logger.error("callExternalAPI failed", error);
        const message =
          error instanceof AppError
            ? error.message
            : error instanceof Error
            ? error.message
            : "Failed to call external API";
        return textResponse(`❌ Error: ${message}`);
      }
    }
  );
}
