/**
 * Get Trending Snippets Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface GetTrendingSnippetsParams {
  page?: number;
  limit?: number;
}

class GetTrendingSnippetsTool extends BaseToolHandler implements BaseToolDefinition<GetTrendingSnippetsParams> {
  name = "getTrendingSnippets";
  description = "Get trending snippets";
  
  paramsSchema = z.object({
    page: z.number().optional().default(1).describe("Page number for pagination"),
    limit: z.number().optional().default(20).describe("Number of items per page"),
  });

  async execute(params: GetTrendingSnippetsParams): Promise<FormattedResponse> {
    this.logStart(this.name, params as Record<string, unknown>);

    try {
      const apiService = this.getApiService();
      const queryParams: Record<string, number> = {};
      if (params.page) queryParams.page = params.page;
      if (params.limit) queryParams.limit = params.limit;

      const result = await apiService.get("/api/snippets/trending", queryParams);
      return jsonResponse(result, `✅ Retrieved trending snippets`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to get trending snippets");
    }
  }
}

export const getTrendingSnippetsTool = new GetTrendingSnippetsTool();




