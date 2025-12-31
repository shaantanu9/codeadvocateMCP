/**
 * Get Repository Rule Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../../base/tool-handler.base.js";
import { jsonResponse } from "../../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../../base/base-tool.interface.js";
import type { FormattedResponse } from "../../../utils/response-formatter.js";

export interface GetRepositoryRuleParams {
  repositoryId: string;
  ruleId: string;
}

class GetRepositoryRuleTool extends BaseToolHandler implements BaseToolDefinition<GetRepositoryRuleParams> {
  name = "getRepositoryRule";
  description = "Get a specific rule for a repository";
  
  paramsSchema = z.object({
    repositoryId: z.string().describe("The ID of the repository"),
    ruleId: z.string().describe("The ID of the rule"),
  });

  async execute(params: GetRepositoryRuleParams): Promise<FormattedResponse> {
    const { startTime } = this.logStart(this.name, params as unknown as Record<string, unknown>);

    try {
      const apiService = this.getApiService();
      const result = await apiService.get(`/api/repositories/${params.repositoryId}/rules/${params.ruleId}`);
      
      this.logSuccess(this.name, params as unknown as Record<string, unknown>, startTime, {
        success: true,
        message: `Retrieved rule ${params.ruleId} for repository: ${params.repositoryId}`,
      });
      
      return jsonResponse(result, `✅ Retrieved rule ${params.ruleId} for repository: ${params.repositoryId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to get repository rule", params as unknown as Record<string, unknown>, startTime);
    }
  }
}

export const getRepositoryRuleTool = new GetRepositoryRuleTool();

