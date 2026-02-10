/**
 * Search Tool
 *
 * Multi-source search across snippets, documentations, learnings, patterns, and more.
 * Uses the skills/search API which aggregates results by relevance score.
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface SearchParams {
  query: string;
  type?: string;
  language?: string;
  page?: number;
  limit?: number;
}

class SearchTool extends BaseToolHandler implements BaseToolDefinition<SearchParams> {
  name = "search";
  description = "Search across all content — snippets, documentations, learnings, patterns, and more. This is the best tool to use when looking for code patterns, finding saved snippets by description, or discovering relevant content. Returns results ranked by relevance.";

  paramsSchema = z.object({
    query: z.string().describe("Natural language search query, e.g. 'React authentication hook' or 'database connection pool'"),
    type: z.string().optional().describe("Filter by content type: snippets, documentations, learnings, patterns, or all (default: all)"),
    language: z.string().optional().describe("Filter by programming language"),
    page: z.number().optional().describe("Page number for pagination (default: 1)"),
    limit: z.number().optional().describe("Results per page (default: 20)"),
  });

  async execute(params: SearchParams): Promise<FormattedResponse> {
    this.logStart(this.name, { query: params.query, type: params.type });

    try {
      const apiService = this.getApiService();
      const queryParams: Record<string, string | number> = {
        q: params.query,
      };
      if (params.type) queryParams.type = params.type;
      if (params.language) queryParams.language = params.language;
      if (params.page) queryParams.page = params.page;
      if (params.limit) queryParams.limit = params.limit;

      const result = await apiService.get("/api/skills/search", queryParams);
      return jsonResponse(result, `✅ Search results for: "${params.query}"`);
    } catch (error) {
      return this.handleError(this.name, error, "Search failed");
    }
  }
}

export const searchTool = new SearchTool();
