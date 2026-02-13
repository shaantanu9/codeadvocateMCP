/**
 * Collections Tool (Consolidated)
 *
 * Manages collections and their snippet associations.
 * Actions: list, get, create, update, delete, listSnippets, addSnippet, removeSnippet
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

interface CollectionsParams {
  action: "list" | "get" | "create" | "update" | "delete" | "listSnippets" | "addSnippet" | "removeSnippet";
  collectionId?: string;
  snippetId?: string;
  name?: string;
  description?: string;
  search?: string;
  page?: number;
  limit?: number;
}

class CollectionsTool
  extends BaseToolHandler
  implements BaseToolDefinition<CollectionsParams>
{
  name = "collections";
  description =
    "Manage collections of snippets. Supports listing, creating, updating, deleting collections, and managing snippet associations within collections.";

  paramsSchema = z.object({
    action: z
      .enum([
        "list",
        "get",
        "create",
        "update",
        "delete",
        "listSnippets",
        "addSnippet",
        "removeSnippet",
      ])
      .describe("The action to perform"),
    collectionId: z.string().optional().describe("The collection ID (required for get, update, delete, listSnippets, addSnippet, removeSnippet)"),
    snippetId: z.string().optional().describe("The snippet ID (required for addSnippet, removeSnippet)"),
    name: z.string().optional().describe("Collection name (required for create)"),
    description: z.string().optional().describe("Collection description"),
    search: z.string().optional().describe("Search query for filtering collections"),
    page: z.number().optional().describe("Page number for pagination"),
    limit: z.number().optional().describe("Number of items per page"),
  });

  annotations = {
    readOnlyHint: false,
    destructiveHint: true,
    idempotentHint: false,
    openWorldHint: true,
  };

  async execute(params: CollectionsParams): Promise<FormattedResponse> {
    const { startTime } = this.logStart(this.name, params as unknown as Record<string, unknown>);

    try {
      const apiService = this.getApiService();
      let result: unknown;

      switch (params.action) {
        case "list": {
          const query: Record<string, string | number | boolean> = {};
          if (params.search) query.search = params.search;
          if (params.page) query.page = params.page;
          if (params.limit) query.limit = params.limit;
          result = await apiService.get("/api/collections", query);
          break;
        }

        case "get": {
          const collectionId = this.requireParam(params.collectionId, "collectionId", "get");
          result = await apiService.get(`/api/collections/${collectionId}`);
          break;
        }

        case "create": {
          const name = this.requireParam(params.name, "name", "create");
          const body: Record<string, unknown> = { name };
          if (params.description) body.description = params.description;
          result = await apiService.post("/api/collections", body);
          break;
        }

        case "update": {
          const collectionId = this.requireParam(params.collectionId, "collectionId", "update");
          const body: Record<string, unknown> = {};
          if (params.name) body.name = params.name;
          if (params.description) body.description = params.description;
          result = await apiService.put(`/api/collections/${collectionId}`, body);
          break;
        }

        case "delete": {
          const collectionId = this.requireParam(params.collectionId, "collectionId", "delete");
          result = await apiService.delete(`/api/collections/${collectionId}`);
          break;
        }

        case "listSnippets": {
          const collectionId = this.requireParam(params.collectionId, "collectionId", "listSnippets");
          const query: Record<string, string | number | boolean> = {};
          if (params.page) query.page = params.page;
          if (params.limit) query.limit = params.limit;
          result = await apiService.get(`/api/collections/${collectionId}/snippets`, query);
          break;
        }

        case "addSnippet": {
          const collectionId = this.requireParam(params.collectionId, "collectionId", "addSnippet");
          const snippetId = this.requireParam(params.snippetId, "snippetId", "addSnippet");
          result = await apiService.post(`/api/collections/${collectionId}/snippets`, {
            snippetIds: [snippetId],
          });
          break;
        }

        case "removeSnippet": {
          const collectionId = this.requireParam(params.collectionId, "collectionId", "removeSnippet");
          const snippetId = this.requireParam(params.snippetId, "snippetId", "removeSnippet");
          result = await apiService.delete(`/api/collections/${collectionId}/snippets/${snippetId}`);
          break;
        }
      }

      this.logSuccess(this.name, params as unknown as Record<string, unknown>, startTime, {
        success: true,
        message: `collections.${params.action} completed`,
      });

      return jsonResponse(result, `collections.${params.action} completed successfully`);
    } catch (error) {
      return this.handleError(
        this.name,
        error,
        `Failed to execute collections.${params.action}`,
        params as unknown as Record<string, unknown>,
        startTime
      );
    }
  }
}

export const collectionsTool = new CollectionsTool();
