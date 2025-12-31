/**
 * Update Repository Rule Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../../base/tool-handler.base.js";
import { jsonResponse } from "../../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../../base/base-tool.interface.js";
import type { FormattedResponse } from "../../../utils/response-formatter.js";

export interface UpdateRepositoryRuleParams {
  repositoryId: string;
  ruleId: string;
  title?: string;
  ruleContent?: string;
  ruleType?: string;
  severity?: string;
}

class UpdateRepositoryRuleTool extends BaseToolHandler implements BaseToolDefinition<UpdateRepositoryRuleParams> {
  name = "updateRepositoryRule";
  description = "Update a rule for a repository";
  
  paramsSchema = z.object({
    repositoryId: z.string().describe("The ID of the repository"),
    ruleId: z.string().describe("The ID of the rule"),
    title: z.string().optional().describe("Title of the rule"),
    ruleContent: z.string().optional().describe("Content of the rule"),
    ruleType: z.string().optional().describe("Type of rule"),
    severity: z.string().optional().describe("Severity (error, warning, info)"),
  });

  async execute(params: UpdateRepositoryRuleParams): Promise<FormattedResponse> {
    const { startTime } = this.logStart(this.name, params);

    try {
      const apiService = this.getApiService();
      const body: Record<string, unknown> = {};
      if (params.title) body.title = params.title;
      if (params.ruleContent) body.rule_content = params.ruleContent;
      if (params.ruleType) body.rule_type = params.ruleType;
      if (params.severity) body.severity = params.severity;

      const result = await apiService.put(`/api/repositories/${params.repositoryId}/rules/${params.ruleId}`, body);
      
      this.logSuccess(this.name, params, startTime, {
        success: true,
        message: `Updated rule ${params.ruleId} for repository: ${params.repositoryId}`,
      });
      
      return jsonResponse(result, `✅ Updated rule ${params.ruleId} for repository: ${params.repositoryId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to update repository rule", params, startTime);
    }
  }
}

export const updateRepositoryRuleTool = new UpdateRepositoryRuleTool();

