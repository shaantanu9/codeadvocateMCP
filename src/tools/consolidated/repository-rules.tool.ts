/**
 * Consolidated Repository Rules Tool
 *
 * Combines all repository rule operations into a single tool with an action parameter.
 * Actions: list, get, create, update, setupMcpGuidance
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import { buildQueryParams, buildPaginationParams } from "../../utils/query-params.js";
import { setupMcpGuidanceRulesTool } from "../repositories/rules/setup-mcp-guidance-rules.tool.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

const ACTIONS = ["list", "get", "create", "update", "setupMcpGuidance"] as const;

interface Params {
  action: (typeof ACTIONS)[number];
  repositoryId?: string;
  ruleId?: string;
  title?: string;
  ruleContent?: string;
  ruleType?: string;
  severity?: string;
  search?: string;
  page?: number;
  limit?: number;
  overwrite?: boolean;
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

class RepositoryRulesTool extends BaseToolHandler implements BaseToolDefinition<Params> {
  name = "repositoryRules";

  description = `Manage repository rules. Use 'action' to specify operation:
- list: List rules (requires: repositoryId; optional: search, ruleType, severity, page, limit)
- get: Get rule by ID (requires: repositoryId, ruleId)
- create: Create new rule (requires: title, ruleContent; repositoryId auto-detected if not provided; optional: ruleType, severity)
- update: Update rule (requires: repositoryId, ruleId; optional: title, ruleContent, ruleType, severity)
- setupMcpGuidance: Setup default MCP guidance rules (repositoryId auto-detected if not provided; optional: overwrite)`;

  paramsSchema = z.object({
    action: z.enum(ACTIONS).describe("Operation to perform"),
    repositoryId: z.string().optional().describe("Repository ID. Auto-detected if not provided for create/setupMcpGuidance."),
    ruleId: z.string().optional().describe("Rule ID. Required for: get, update"),
    title: z.string().optional().describe("Rule title. Required for: create"),
    ruleContent: z.string().optional().describe("Rule content. Required for: create"),
    ruleType: z.string().optional().describe("Rule type. User-friendly values: code-quality (maps to coding_standard), naming (maps to naming_convention), git (maps to git_workflow)"),
    severity: z.enum(["error", "warning", "info", "critical"]).optional().describe("Severity level"),
    search: z.string().optional().describe("Search term to filter rules"),
    page: z.number().int().min(1).optional().default(1).describe("Page number for pagination"),
    limit: z.number().int().min(1).max(100).optional().default(20).describe("Items per page (max: 100)"),
    overwrite: z.boolean().optional().default(false).describe("For setupMcpGuidance: overwrite existing rules (default: false)"),
  });

  annotations = { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true };

  async execute(params: Params): Promise<FormattedResponse> {
    const api = this.getApiService();
    switch (params.action) {
      case "list": {
        const repositoryId = this.requireParam(params.repositoryId, "repositoryId", "list");
        const { startTime } = this.logStart(`${this.name}.list`, { repositoryId });
        try {
          const pagination = buildPaginationParams(params.page, params.limit, 1, 20, 100);
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
          const result = await api.get(`/api/repositories/${repositoryId}/rules`, queryParams);
          this.logSuccess(`${this.name}.list`, { repositoryId }, startTime);
          return jsonResponse(result, `✅ Retrieved rules for repository: ${repositoryId}`);
        } catch (error) {
          return this.handleError(`${this.name}.list`, error, "Failed to list rules", { repositoryId }, startTime);
        }
      }
      case "get": {
        const repositoryId = this.requireParam(params.repositoryId, "repositoryId", "get");
        const ruleId = this.requireParam(params.ruleId, "ruleId", "get");
        const { startTime } = this.logStart(`${this.name}.get`, { repositoryId, ruleId });
        try {
          const result = await api.get(`/api/repositories/${repositoryId}/rules/${ruleId}`);
          this.logSuccess(`${this.name}.get`, { repositoryId, ruleId }, startTime);
          return jsonResponse(result, `✅ Retrieved rule ${ruleId} for repository: ${repositoryId}`);
        } catch (error) {
          return this.handleError(`${this.name}.get`, error, "Failed to get rule", { repositoryId, ruleId }, startTime);
        }
      }
      case "create": {
        const title = this.requireParam(params.title, "title", "create");
        const ruleContent = this.requireParam(params.ruleContent, "ruleContent", "create");
        const repositoryId = await this.resolveRepositoryId(params.repositoryId);
        const { startTime } = this.logStart(`${this.name}.create`, { repositoryId, title });
        try {
          const body: Record<string, unknown> = {
            title,
            rule_content: ruleContent,
          };

          const mappedRuleType = mapRuleType(params.ruleType);
          if (mappedRuleType !== "other" || params.ruleType) {
            body.rule_type = mappedRuleType;
          }
          if (params.severity !== undefined) body.severity = params.severity;

          const result = await api.post(`/api/repositories/${repositoryId}/rules`, body);
          this.logSuccess(`${this.name}.create`, { repositoryId, title }, startTime);
          return jsonResponse(result, `✅ Created rule for repository: ${repositoryId}`);
        } catch (error) {
          return this.handleError(`${this.name}.create`, error, "Failed to create rule", { repositoryId, title }, startTime);
        }
      }
      case "update": {
        const repositoryId = this.requireParam(params.repositoryId, "repositoryId", "update");
        const ruleId = this.requireParam(params.ruleId, "ruleId", "update");
        const { startTime } = this.logStart(`${this.name}.update`, { repositoryId, ruleId });
        try {
          const body: Record<string, unknown> = {};
          if (params.title !== undefined) body.title = params.title;
          if (params.ruleContent !== undefined) body.rule_content = params.ruleContent;
          if (params.ruleType !== undefined) body.rule_type = params.ruleType;
          if (params.severity !== undefined) body.severity = params.severity;

          const result = await api.put(`/api/repositories/${repositoryId}/rules/${ruleId}`, body);
          this.logSuccess(`${this.name}.update`, { repositoryId, ruleId }, startTime);
          return jsonResponse(result, `✅ Updated rule ${ruleId} for repository: ${repositoryId}`);
        } catch (error) {
          return this.handleError(`${this.name}.update`, error, "Failed to update rule", { repositoryId, ruleId }, startTime);
        }
      }
      case "setupMcpGuidance": {
        return setupMcpGuidanceRulesTool.execute({
          repositoryId: params.repositoryId,
          overwrite: params.overwrite,
        });
      }
      default:
        return this.handleError(this.name, new Error(`Unknown action: ${params.action}`), `Unknown action`);
    }
  }
}

export const repositoryRulesTool = new RepositoryRulesTool();
