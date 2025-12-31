/**
 * List Company Repositories Tool
 * 
 * Get all repositories linked to a company (direct and via collections).
 */

import { z } from "zod";
import { BaseToolHandler } from "../../base/tool-handler.base.js";
import { jsonResponse } from "../../../utils/response-formatter.js";
import { buildQueryParams, buildPaginationParams } from "../../../utils/query-params.js";
import type { BaseToolDefinition } from "../../base/base-tool.interface.js";
import type { FormattedResponse } from "../../../utils/response-formatter.js";

export interface ListCompanyRepositoriesParams {
  companyId: string;
  page?: number;
  limit?: number;
  search?: string;
}

class ListCompanyRepositoriesTool extends BaseToolHandler implements BaseToolDefinition<ListCompanyRepositoriesParams> {
  name = "listCompanyRepositories";
  description = "Get all repositories linked to a company (direct and via collections)";
  
  paramsSchema = z.object({
    companyId: z.string().describe("The ID of the company"),
    page: z.number().int().min(1).optional().default(1).describe("Page number for pagination"),
    limit: z.number().int().min(1).max(100).optional().default(20).describe("Number of items per page (max: 100)"),
    search: z.string().optional().describe("Search term to filter repositories"),
  });

  async execute(params: ListCompanyRepositoriesParams): Promise<FormattedResponse> {
    const { startTime } = this.logStart(this.name, params as Record<string, unknown>);

    try {
      const apiService = this.getApiService();
      
      // Build pagination params with validation
      const pagination = buildPaginationParams(params.page, params.limit, 1, 20, 100);
      
      // Build query params
      const queryParams = buildQueryParams({
        page: pagination.page,
        limit: pagination.limit,
        search: params.search,
      });

      const result = await apiService.get(`/api/companies/${params.companyId}/repositories`, queryParams);
      
      this.logSuccess(this.name, params as Record<string, unknown>, startTime, {
        success: true,
        message: `Retrieved repositories for company: ${params.companyId}`,
      });
      
      return jsonResponse(result, `✅ Retrieved repositories for company: ${params.companyId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to list company repositories", params as Record<string, unknown>, startTime);
    }
  }
}

export const listCompanyRepositoriesTool = new ListCompanyRepositoriesTool();

