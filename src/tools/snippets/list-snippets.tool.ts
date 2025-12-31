/**
 * List Snippets Tool
 * 
 * Lists code snippets from the external API with filtering and pagination
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface ListSnippetsParams {
  search?: string;
  language?: string;
  tags?: string;
  projectId?: string;
  favorite?: boolean;
  context?: string;
  page?: number;
  limit?: number;
}

class ListSnippetsTool extends BaseToolHandler implements BaseToolDefinition<ListSnippetsParams> {
  name = "listSnippets";
  description = "List code snippets from the external API with search, filters, and pagination";
  
  paramsSchema = z.object({
    search: z.string().optional().describe("Search term to filter snippets"),
    language: z.string().optional().describe("Filter by programming language"),
    tags: z.string().optional().describe("Comma-separated tags to filter"),
    projectId: z.string().optional().describe("Filter by project ID"),
    favorite: z.boolean().optional().describe("Filter by favorite status"),
    context: z.string().optional().describe("Filter by context (all, personal, shared)"),
    page: z.number().optional().default(1).describe("Page number for pagination"),
    limit: z.number().optional().default(20).describe("Number of items per page"),
  });

  async execute(params: ListSnippetsParams): Promise<FormattedResponse> {
    this.logStart(this.name, params as unknown as Record<string, unknown>);

    try {
      const apiService = this.getApiService();
      const queryParams: Record<string, string | number | boolean> = {};
      
      if (params.search) queryParams.search = params.search;
      if (params.language) queryParams.language = params.language;
      if (params.tags) queryParams.tags = params.tags;
      if (params.projectId) queryParams.projectId = params.projectId;
      if (params.favorite !== undefined) queryParams.favorite = params.favorite;
      if (params.context) queryParams.context = params.context;
      if (params.page) queryParams.page = params.page;
      if (params.limit) queryParams.limit = params.limit;

      const result = await apiService.get("/api/snippets", queryParams);
      return jsonResponse(
        result,
        `✅ Retrieved snippets (Page ${params.page || 1}, Limit ${params.limit || 20})`
      );
    } catch (error) {
      return this.handleError(this.name, error, "Failed to list snippets");
    }
  }
}

export const listSnippetsTool = new ListSnippetsTool();




