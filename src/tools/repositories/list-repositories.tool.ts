/**
 * List Repositories Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import { buildQueryParams, buildPaginationParams } from "../../utils/query-params.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface ListRepositoriesParams {
  type?: "all" | "individual" | "company";
  search?: string;
  page?: number;
  limit?: number;
}

class ListRepositoriesTool extends BaseToolHandler implements BaseToolDefinition<ListRepositoriesParams> {
  name = "listRepositories";
  description = "List repositories with type filter (all/individual/company) and search";
  
  paramsSchema = z.object({
    type: z.enum(["all", "individual", "company"]).optional().describe("Filter by repository type"),
    search: z.string().optional().describe("Search term to filter repositories"),
    page: z.number().int().min(1).optional().default(1).describe("Page number for pagination"),
    limit: z.number().int().min(1).max(100).optional().default(20).describe("Number of items per page (max: 100)"),
  });

  async execute(params: ListRepositoriesParams): Promise<FormattedResponse> {
    const { startTime } = this.logStart(this.name, params as Record<string, unknown>);

    try {
      const apiService = this.getApiService();
      
      // Build pagination params with validation
      const pagination = buildPaginationParams(params.page, params.limit, 1, 20, 100);
      
      // Build query params
      const queryParams = buildQueryParams({
        type: params.type,
        search: params.search,
        page: pagination.page,
        limit: pagination.limit,
      });

      const result = await apiService.get("/api/repositories", queryParams);
      
      this.logSuccess(this.name, params as Record<string, unknown>, startTime, {
        success: true,
        message: "Retrieved repositories",
      });
      
      return jsonResponse(result, `✅ Retrieved repositories`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to list repositories", params as Record<string, unknown>, startTime);
    }
  }
}

export const listRepositoriesTool = new ListRepositoriesTool();


