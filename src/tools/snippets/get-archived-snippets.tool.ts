/**
 * Get Archived Snippets Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface GetArchivedSnippetsParams {
  search?: string;
  language?: string;
  page?: number;
  limit?: number;
}

class GetArchivedSnippetsTool extends BaseToolHandler implements BaseToolDefinition<GetArchivedSnippetsParams> {
  name = "getArchivedSnippets";
  description = "Get archived snippets with search and filters";
  
  paramsSchema = z.object({
    search: z.string().optional().describe("Search term to filter snippets"),
    language: z.string().optional().describe("Filter by programming language"),
    page: z.number().optional().default(1).describe("Page number for pagination"),
    limit: z.number().optional().default(20).describe("Number of items per page"),
  });

  async execute(params: GetArchivedSnippetsParams): Promise<FormattedResponse> {
    this.logStart(this.name, params as unknown as Record<string, unknown>);

    try {
      const apiService = this.getApiService();
      const queryParams: Record<string, string | number> = {};
      if (params.search) queryParams.search = params.search;
      if (params.language) queryParams.language = params.language;
      if (params.page) queryParams.page = params.page;
      if (params.limit) queryParams.limit = params.limit;

      const result = await apiService.get("/api/snippets/archived", queryParams);
      return jsonResponse(result, `✅ Retrieved archived snippets`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to get archived snippets");
    }
  }
}

export const getArchivedSnippetsTool = new GetArchivedSnippetsTool();




