/**
 * Create Repository Rule Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../../base/tool-handler.base.js";
import { jsonResponse } from "../../../utils/response-formatter.js";
import { logger } from "../../../core/logger.js";
import type { BaseToolDefinition } from "../../base/base-tool.interface.js";
import type { FormattedResponse } from "../../../utils/response-formatter.js";

export interface CreateRepositoryRuleParams {
  repositoryId: string;
  title: string;
  ruleContent: string;
  ruleType?: string;
  severity?: string;
}

/**
 * Map user-friendly rule type to API enum value
 */
function mapRuleType(userType: string | undefined): string {
  if (!userType) return "other";

  const mapping: Record<string, string> = {
    "code-quality": "coding_standard",
    testing: "testing",
    documentation: "documentation",
    security: "security",
    performance: "performance",
    architecture: "architecture",
    naming: "naming_convention",
    git: "git_workflow",
    // Direct API values pass through
    coding_standard: "coding_standard",
    naming_convention: "naming_convention",
    git_workflow: "git_workflow",
  };

  return mapping[userType.toLowerCase()] || "other";
}

class CreateRepositoryRuleTool
  extends BaseToolHandler
  implements BaseToolDefinition<CreateRepositoryRuleParams>
{
  name = "createRepositoryRule";
  description = "Create a rule for a repository";

  paramsSchema = z.object({
    repositoryId: z.string().describe("The ID of the repository"),
    title: z.string().describe("Title of the rule"),
    ruleContent: z.string().describe("Content of the rule"),
    ruleType: z
      .enum([
        "coding_standard",
        "naming_convention",
        "architecture",
        "security",
        "performance",
        "testing",
        "documentation",
        "git_workflow",
        "other",
        "code-quality",
        "naming",
        "git",
      ])
      .optional()
      .describe(
        "Type of rule. Allowed values: coding_standard, naming_convention, architecture, security, performance, testing, documentation, git_workflow, other. User-friendly values: code-quality (maps to coding_standard), naming (maps to naming_convention), git (maps to git_workflow)"
      ),
    severity: z
      .enum(["error", "warning", "info", "critical"])
      .optional()
      .describe("Severity (error, warning, info, critical)"),
  });

  async execute(
    params: CreateRepositoryRuleParams
  ): Promise<FormattedResponse> {
    const { startTime } = this.logStart(this.name, { ...params } as Record<
      string,
      unknown
    >);

    try {
      const apiService = this.getApiService();
      const body: Record<string, unknown> = {
        title: params.title,
        rule_content: params.ruleContent,
      };

      // Map user-friendly rule type to API enum value
      const mappedRuleType = mapRuleType(params.ruleType);
      if (mappedRuleType !== "other" || params.ruleType) {
        body.rule_type = mappedRuleType;
      }

      if (params.severity) body.severity = params.severity;

      // Log request details for debugging
      logger.debug(`[${this.name}] Preparing API request`, {
        endpoint: `/api/repositories/${params.repositoryId}/rules`,
        method: "POST",
        body: {
          title: body.title,
          rule_content_length:
            typeof body.rule_content === "string"
              ? body.rule_content.length
              : 0,
          rule_type: body.rule_type || "not provided",
          severity: body.severity || "not provided",
        },
        repositoryId: params.repositoryId,
      });

      const result = await apiService.post(
        `/api/repositories/${params.repositoryId}/rules`,
        body
      );

      // Log success
      this.logSuccess(
        this.name,
        { ...params } as Record<string, unknown>,
        startTime,
        {
          success: true,
          message: `Created rule for repository: ${params.repositoryId}`,
        }
      );

      return jsonResponse(
        result,
        `✅ Created rule for repository: ${params.repositoryId}`
      );
    } catch (error) {
      // Enhanced error logging with validation hints
      if (
        error instanceof Error &&
        error.message.includes("Invalid rule_type")
      ) {
        logger.warn(`[${this.name}] Invalid rule_type provided`, {
          providedRuleType: params.ruleType,
          allowedValues: [
            "coding_standard",
            "naming_convention",
            "architecture",
            "security",
            "performance",
            "testing",
            "documentation",
            "git_workflow",
            "other",
          ],
          suggestion:
            params.ruleType === "code-quality"
              ? "Consider using 'coding_standard'"
              : "Use one of the allowed enum values",
          repositoryId: params.repositoryId,
          title: params.title,
        });
      }

      return this.handleError(
        this.name,
        error,
        "Failed to create repository rule",
        { ...params } as Record<string, unknown>,
        startTime
      );
    }
  }
}

export const createRepositoryRuleTool = new CreateRepositoryRuleTool();
