/**
 * Update Repository PR Rule Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../../base/tool-handler.base.js";
import { jsonResponse } from "../../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../../base/base-tool.interface.js";
import type { FormattedResponse } from "../../../utils/response-formatter.js";

export interface UpdateRepositoryPrRuleParams {
  repositoryId: string;
  ruleId: string;
  title?: string;
  ruleContent?: string;
  ruleType?: string;
  severity?: string;
}

class UpdateRepositoryPrRuleTool extends BaseToolHandler implements BaseToolDefinition<UpdateRepositoryPrRuleParams> {
  name = "updateRepositoryPrRule";
  description = "Update a PR rule for a repository";
  
  paramsSchema = z.object({
    repositoryId: z.string().describe("The ID of the repository"),
    ruleId: z.string().describe("The ID of the PR rule"),
    title: z.string().optional().describe("Title of the PR rule"),
    ruleContent: z.string().optional().describe("Content of the PR rule"),
    ruleType: z.string().optional().describe("Type of rule"),
    severity: z.string().optional().describe("Severity (error, warning, info)"),
  });

  async execute(params: UpdateRepositoryPrRuleParams): Promise<FormattedResponse> {
    const { startTime } = this.logStart(this.name, params as unknown as Record<string, unknown>);

    try {
      const apiService = this.getApiService();
      const body: Record<string, unknown> = {};
      if (params.title) body.title = params.title;
      if (params.ruleContent) body.rule_content = params.ruleContent;
      if (params.ruleType) body.rule_type = params.ruleType;
      if (params.severity) body.severity = params.severity;

      const result = await apiService.put(`/api/repositories/${params.repositoryId}/pr-rules/${params.ruleId}`, body);
      
      this.logSuccess(this.name, params as unknown as Record<string, unknown>, startTime, {
        success: true,
        message: `Updated PR rule ${params.ruleId} for repository: ${params.repositoryId}`,
      });
      
      return jsonResponse(result, `✅ Updated PR rule ${params.ruleId} for repository: ${params.repositoryId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to update repository PR rule", params as unknown as Record<string, unknown>, startTime);
    }
  }
}

export const updateRepositoryPrRuleTool = new UpdateRepositoryPrRuleTool();

