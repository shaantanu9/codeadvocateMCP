/**
 * List Repository PR Rules Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../../base/tool-handler.base.js";
import { jsonResponse } from "../../../utils/response-formatter.js";
import { buildQueryParams, buildPaginationParams } from "../../../utils/query-params.js";
import type { BaseToolDefinition } from "../../base/base-tool.interface.js";
import type { FormattedResponse } from "../../../utils/response-formatter.js";

export interface ListRepositoryPrRulesParams {
  repositoryId: string;
  search?: string;
  ruleType?: string;
  severity?: string;
  page?: number;
  limit?: number;
}

class ListRepositoryPrRulesTool extends BaseToolHandler implements BaseToolDefinition<ListRepositoryPrRulesParams> {
  name = "listRepositoryPrRules";
  description = "List PR rules for a repository";
  
  paramsSchema = z.object({
    repositoryId: z.string().describe("The ID of the repository"),
    search: z.string().optional().describe("Search term to filter PR rules"),
    ruleType: z.string().optional().describe("Filter by rule type"),
    severity: z.string().optional().describe("Filter by severity (error, warning, info)"),
    page: z.number().int().min(1).optional().default(1).describe("Page number for pagination"),
    limit: z.number().int().min(1).max(100).optional().default(20).describe("Number of items per page (max: 100)"),
  });

  async execute(params: ListRepositoryPrRulesParams): Promise<FormattedResponse> {
    const { startTime } = this.logStart(this.name, params as unknown as Record<string, unknown>);

    try {
      const apiService = this.getApiService();
      
      // Build pagination params with validation
      const pagination = buildPaginationParams(params.page, params.limit, 1, 20, 100);
      
      // Build query params
      const queryParams = buildQueryParams(
        {
          page: pagination.page,
          limit: pagination.limit,
          search: params.search,
          ruleType: params.ruleType,
          severity: params.severity,
        },
        {
          ruleType: "rule_type",
        }
      );

      const result = await apiService.get(`/api/repositories/${params.repositoryId}/pr-rules`, queryParams);
      
      this.logSuccess(this.name, params as unknown as Record<string, unknown>, startTime, {
        success: true,
        message: `Retrieved PR rules for repository: ${params.repositoryId}`,
      });
      
      return jsonResponse(result, `✅ Retrieved PR rules for repository: ${params.repositoryId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to list repository PR rules", params as unknown as Record<string, unknown>, startTime);
    }
  }
}

export const listRepositoryPrRulesTool = new ListRepositoryPrRulesTool();

