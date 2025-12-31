/**
 * Create Repository PR Rule Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../../base/tool-handler.base.js";
import { jsonResponse } from "../../../utils/response-formatter.js";
import { logger } from "../../../core/logger.js";
import type { BaseToolDefinition } from "../../base/base-tool.interface.js";
import type { FormattedResponse } from "../../../utils/response-formatter.js";

export interface CreateRepositoryPrRuleParams {
  repositoryId: string;
  title: string;
  ruleContent: string;
  ruleType?: string;
  priority?: string; // PR rules use priority, not severity
}

/**
 * Map user-friendly PR rule type to API enum value
 */
function mapPrRuleType(userType: string | undefined): string {
  if (!userType) return "other";
  
  const mapping: Record<string, string> = {
    "code-quality": "review_checklist",
    "testing": "review_checklist",
    "documentation": "comment_template",
    "approval": "approval_requirement",
    "merge": "merge_condition",
    "automated": "automated_check",
    // Direct API values pass through
    "review_checklist": "review_checklist",
    "approval_requirement": "approval_requirement",
    "merge_condition": "merge_condition",
    "automated_check": "automated_check",
    "comment_template": "comment_template",
  };
  
  return mapping[userType.toLowerCase()] || "other";
}

class CreateRepositoryPrRuleTool extends BaseToolHandler implements BaseToolDefinition<CreateRepositoryPrRuleParams> {
  name = "createRepositoryPrRule";
  description = "Create a PR rule for a repository";
  
  paramsSchema = z.object({
    repositoryId: z.string().describe("The ID of the repository"),
    title: z.string().describe("Title of the PR rule"),
    ruleContent: z.string().describe("Content of the PR rule"),
    ruleType: z.enum(["review_checklist", "approval_requirement", "merge_condition", "automated_check", "comment_template", "other", "code-quality", "testing", "documentation", "approval", "merge", "automated"]).optional().describe("Type of rule. Allowed values: review_checklist, approval_requirement, merge_condition, automated_check, comment_template, other. User-friendly values: code-quality (maps to review_checklist), testing (maps to review_checklist), documentation (maps to comment_template), approval (maps to approval_requirement), merge (maps to merge_condition), automated (maps to automated_check)"),
    priority: z.enum(["low", "medium", "high", "critical"]).optional().describe("Priority (low, medium, high, critical). Note: PR rules use 'priority', not 'severity'"),
  });

  async execute(params: CreateRepositoryPrRuleParams): Promise<FormattedResponse> {
    const { startTime } = this.logStart(this.name, { ...params } as Record<string, unknown>);

    try {
      const apiService = this.getApiService();
      const body: Record<string, unknown> = {
        title: params.title,
        rule_content: params.ruleContent,
      };
      
      // Map user-friendly rule type to API enum value
      const mappedRuleType = mapPrRuleType(params.ruleType);
      if (mappedRuleType !== "other" || params.ruleType) {
        body.rule_type = mappedRuleType;
      }
      
      // PR rules use priority, not severity
      if (params.priority) body.priority = params.priority;

      // Log request details for debugging
      logger.debug(`[${this.name}] Preparing API request`, {
        endpoint: `/api/repositories/${params.repositoryId}/pr-rules`,
        method: "POST",
        body: {
          title: body.title,
          rule_content_length: typeof body.rule_content === "string" ? body.rule_content.length : 0,
          rule_type: body.rule_type || "not provided",
          priority: body.priority || "not provided",
        },
        repositoryId: params.repositoryId,
        note: "PR rules use 'priority' field, not 'severity'",
      });

      const result = await apiService.post(`/api/repositories/${params.repositoryId}/pr-rules`, body);
      
      this.logSuccess(this.name, { ...params } as Record<string, unknown>, startTime, {
        success: true,
        message: `Created PR rule for repository: ${params.repositoryId}`,
      });
      
      return jsonResponse(result, `✅ Created PR rule for repository: ${params.repositoryId}`);
    } catch (error) {
      // Enhanced error logging with validation hints
      if (error instanceof Error && error.message.includes("Invalid rule_type")) {
        logger.warn(`[${this.name}] Invalid rule_type provided`, {
          providedRuleType: params.ruleType,
          allowedValues: ["review_checklist", "approval_requirement", "merge_condition", "automated_check", "comment_template", "other"],
          suggestion: params.ruleType === "code-quality" ? "Consider using 'review_checklist'" : "Use one of the allowed enum values",
          repositoryId: params.repositoryId,
          title: params.title,
        });
      }
      
      return this.handleError(this.name, error, "Failed to create repository PR rule", { ...params } as Record<string, unknown>, startTime);
    }
  }
}

export const createRepositoryPrRuleTool = new CreateRepositoryPrRuleTool();

