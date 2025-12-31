/**
 * Search Personal Knowledge Tool
 * 
 * Unified search across personal knowledge (links, files, notes)
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface SearchPersonalKnowledgeParams {
  search?: string;
  tags?: string;
  category?: string;
  type?: "all" | "links" | "files" | "notes";
  favorite?: boolean;
  page?: number;
  limit?: number;
}

class SearchPersonalKnowledgeTool extends BaseToolHandler implements BaseToolDefinition<SearchPersonalKnowledgeParams> {
  name = "searchPersonalKnowledge";
  description = "Unified search across personal knowledge (links, files, notes) with filters";
  
  paramsSchema = z.object({
    search: z.string().optional().describe("Search term"),
    tags: z.string().optional().describe("Comma-separated tags to filter"),
    category: z.string().optional().describe("Filter by category"),
    type: z.enum(["all", "links", "files", "notes"]).optional().describe("Filter by type"),
    favorite: z.boolean().optional().describe("Filter by favorite status"),
    page: z.number().optional().default(1).describe("Page number for pagination"),
    limit: z.number().optional().default(20).describe("Number of items per page"),
  });

  async execute(params: SearchPersonalKnowledgeParams): Promise<FormattedResponse> {
    this.logStart(this.name, params as Record<string, unknown>);

    try {
      const apiService = this.getApiService();
      const queryParams: Record<string, string | number | boolean> = {};
      if (params.search) queryParams.search = params.search;
      if (params.tags) queryParams.tags = params.tags;
      if (params.category) queryParams.category = params.category;
      if (params.type) queryParams.type = params.type;
      if (params.favorite !== undefined) queryParams.favorite = params.favorite;
      if (params.page) queryParams.page = params.page;
      if (params.limit) queryParams.limit = params.limit;

      const result = await apiService.get("/api/personal/knowledge", queryParams);
      return jsonResponse(result, `✅ Retrieved personal knowledge`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to search personal knowledge");
    }
  }
}

export const searchPersonalKnowledgeTool = new SearchPersonalKnowledgeTool();




