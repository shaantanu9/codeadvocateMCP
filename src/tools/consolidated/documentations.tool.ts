/**
 * Documentations Tool (Consolidated)
 *
 * Manages documentation entries.
 * Actions: list, get, create, update, getMcpContext
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

interface DocumentationsParams {
  action: "list" | "get" | "create" | "update" | "getMcpContext";
  documentationId?: string;
  title?: string;
  content?: string;
  type?: string;
  category?: string;
  metadata?: Record<string, unknown>;
  search?: string;
  page?: number;
  limit?: number;
}

class DocumentationsTool
  extends BaseToolHandler
  implements BaseToolDefinition<DocumentationsParams>
{
  name = "documentations";
  description =
    "Manage documentation entries. Supports listing, getting, creating, updating documentations, and retrieving MCP context.";

  paramsSchema = z.object({
    action: z
      .enum(["list", "get", "create", "update", "getMcpContext"])
      .describe("The action to perform"),
    documentationId: z.string().optional().describe("The documentation ID (required for get, update)"),
    title: z.string().optional().describe("Documentation title (required for create)"),
    content: z.string().optional().describe("Documentation content (required for create)"),
    type: z
      .enum(["service", "component", "module", "library", "overview", "logic-flow", "other", "adr"])
      .optional()
      .describe("Documentation type"),
    category: z.string().optional().describe("Documentation category"),
    metadata: z.record(z.unknown()).optional().describe("Additional metadata as key-value pairs"),
    search: z.string().optional().describe("Search query for filtering documentations"),
    page: z.number().optional().describe("Page number for pagination"),
    limit: z.number().optional().describe("Number of items per page"),
  });

  annotations = {
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
  };

  async execute(params: DocumentationsParams): Promise<FormattedResponse> {
    const { startTime } = this.logStart(this.name, params as unknown as Record<string, unknown>);

    try {
      const apiService = this.getApiService();
      let result: unknown;

      switch (params.action) {
        case "list": {
          const query: Record<string, string | number | boolean> = {};
          if (params.search) query.search = params.search;
          if (params.type) query.type = params.type;
          if (params.category) query.category = params.category;
          if (params.page) query.page = params.page;
          if (params.limit) query.limit = params.limit;
          result = await apiService.get("/api/documentations", query);
          break;
        }

        case "get": {
          const documentationId = this.requireParam(params.documentationId, "documentationId", "get");
          result = await apiService.get(`/api/documentations/${documentationId}`);
          break;
        }

        case "create": {
          const title = this.requireParam(params.title, "title", "create");
          const content = this.requireParam(params.content, "content", "create");
          const body: Record<string, unknown> = { title, content };
          if (params.type) body.type = params.type;
          if (params.category) body.category = params.category;
          if (params.metadata) body.metadata = params.metadata;
          result = await apiService.post("/api/documentations", body);
          break;
        }

        case "update": {
          const documentationId = this.requireParam(params.documentationId, "documentationId", "update");
          const body: Record<string, unknown> = {};
          if (params.title) body.title = params.title;
          if (params.content) body.content = params.content;
          if (params.type) body.type = params.type;
          if (params.category) body.category = params.category;
          if (params.metadata) body.metadata = params.metadata;
          result = await apiService.put(`/api/documentations/${documentationId}`, body);
          break;
        }

        case "getMcpContext": {
          result = await apiService.get("/api/documentations/mcp/context");
          break;
        }
      }

      this.logSuccess(this.name, params as unknown as Record<string, unknown>, startTime, {
        success: true,
        message: `documentations.${params.action} completed`,
      });

      return jsonResponse(result, `documentations.${params.action} completed successfully`);
    } catch (error) {
      return this.handleError(
        this.name,
        error,
        `Failed to execute documentations.${params.action}`,
        params as unknown as Record<string, unknown>,
        startTime
      );
    }
  }
}

export const documentationsTool = new DocumentationsTool();
