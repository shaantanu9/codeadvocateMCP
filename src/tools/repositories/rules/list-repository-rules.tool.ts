/**
 * List Repository Rules Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../../base/tool-handler.base.js";
import { jsonResponse } from "../../../utils/response-formatter.js";
import { buildQueryParams, buildPaginationParams } from "../../../utils/query-params.js";
import type { BaseToolDefinition } from "../../base/base-tool.interface.js";
import type { FormattedResponse } from "../../../utils/response-formatter.js";

export interface ListRepositoryRulesParams {
  repositoryId: string;
  search?: string;
  ruleType?: string;
  severity?: string;
  page?: number;
  limit?: number;
}

class ListRepositoryRulesTool extends BaseToolHandler implements BaseToolDefinition<ListRepositoryRulesParams> {
  name = "listRepositoryRules";
  description = "List rules for a repository";
  
  paramsSchema = z.object({
    repositoryId: z.string().describe("The ID of the repository"),
    search: z.string().optional().describe("Search term to filter rules"),
    ruleType: z.string().optional().describe("Filter by rule type"),
    severity: z.string().optional().describe("Filter by severity (error, warning, info)"),
    page: z.number().int().min(1).optional().default(1).describe("Page number for pagination"),
    limit: z.number().int().min(1).max(100).optional().default(20).describe("Number of items per page (max: 100)"),
  });

  async execute(params: ListRepositoryRulesParams): Promise<FormattedResponse> {
    const { startTime } = this.logStart(this.name, params);

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

      const result = await apiService.get(`/api/repositories/${params.repositoryId}/rules`, queryParams);
      
      this.logSuccess(this.name, params, startTime, {
        success: true,
        message: `Retrieved rules for repository: ${params.repositoryId}`,
      });
      
      return jsonResponse(result, `✅ Retrieved rules for repository: ${params.repositoryId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to list repository rules", params, startTime);
    }
  }
}

export const listRepositoryRulesTool = new ListRepositoryRulesTool();


