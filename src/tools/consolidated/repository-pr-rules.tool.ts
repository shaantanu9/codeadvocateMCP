/**
 * Consolidated Repository PR Rules Tool
 *
 * Combines all repository PR rule operations into a single tool with an action parameter.
 * Actions: list, get, create, update
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import { buildQueryParams, buildPaginationParams } from "../../utils/query-params.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

const ACTIONS = ["list", "get", "create", "update"] as const;

interface Params {
  action: (typeof ACTIONS)[number];
  repositoryId?: string;
  ruleId?: string;
  title?: string;
  ruleContent?: string;
  ruleType?: string;
  priority?: string;
  severity?: string;
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * Map user-friendly PR rule type to API enum value
 */
function mapPrRuleType(userType: string | undefined): string {
  if (!userType) return "other";

  const mapping: Record<string, string> = {
    "code-quality": "review_checklist",
    testing: "review_checklist",
    documentation: "comment_template",
    approval: "approval_requirement",
    merge: "merge_condition",
    automated: "automated_check",
    // Direct API values pass through
    review_checklist: "review_checklist",
    approval_requirement: "approval_requirement",
    merge_condition: "merge_condition",
    automated_check: "automated_check",
    comment_template: "comment_template",
  };

  return mapping[userType.toLowerCase()] || "other";
}

class RepositoryPrRulesTool extends BaseToolHandler implements BaseToolDefinition<Params> {
  name = "repositoryPrRules";

  description = `Manage repository PR rules. Use 'action' to specify operation:
- list: List PR rules (requires: repositoryId; optional: search, ruleType, severity, page, limit)
- get: Get PR rule by ID (requires: repositoryId, ruleId)
- create: Create new PR rule (requires: repositoryId, title, ruleContent; optional: ruleType, priority)
- update: Update PR rule (requires: repositoryId, ruleId; optional: title, ruleContent, ruleType, severity)`;

  paramsSchema = z.object({
    action: z.enum(ACTIONS).describe("Operation to perform"),
    repositoryId: z.string().optional().describe("Repository ID. Required for all actions."),
    ruleId: z.string().optional().describe("PR Rule ID. Required for: get, update"),
    title: z.string().optional().describe("PR rule title. Required for: create"),
    ruleContent: z.string().optional().describe("PR rule content. Required for: create"),
    ruleType: z.string().optional().describe("Rule type. User-friendly values: code-quality (maps to review_checklist), testing (maps to review_checklist), documentation (maps to comment_template), approval (maps to approval_requirement), merge (maps to merge_condition), automated (maps to automated_check)"),
    priority: z.enum(["low", "medium", "high", "critical"]).optional().describe("Priority level for create. Note: PR rules use 'priority', not 'severity'"),
    severity: z.string().optional().describe("Severity filter for list/update"),
    search: z.string().optional().describe("Search term to filter PR rules"),
    page: z.number().int().min(1).optional().default(1).describe("Page number for pagination"),
    limit: z.number().int().min(1).max(100).optional().default(20).describe("Items per page (max: 100)"),
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
          const result = await api.get(`/api/repositories/${repositoryId}/pr-rules`, queryParams);
          this.logSuccess(`${this.name}.list`, { repositoryId }, startTime);
          return jsonResponse(result, `✅ Retrieved PR rules for repository: ${repositoryId}`);
        } catch (error) {
          return this.handleError(`${this.name}.list`, error, "Failed to list PR rules", { repositoryId }, startTime);
        }
      }
      case "get": {
        const repositoryId = this.requireParam(params.repositoryId, "repositoryId", "get");
        const ruleId = this.requireParam(params.ruleId, "ruleId", "get");
        const { startTime } = this.logStart(`${this.name}.get`, { repositoryId, ruleId });
        try {
          const result = await api.get(`/api/repositories/${repositoryId}/pr-rules/${ruleId}`);
          this.logSuccess(`${this.name}.get`, { repositoryId, ruleId }, startTime);
          return jsonResponse(result, `✅ Retrieved PR rule ${ruleId} for repository: ${repositoryId}`);
        } catch (error) {
          return this.handleError(`${this.name}.get`, error, "Failed to get PR rule", { repositoryId, ruleId }, startTime);
        }
      }
      case "create": {
        const repositoryId = this.requireParam(params.repositoryId, "repositoryId", "create");
        const title = this.requireParam(params.title, "title", "create");
        const ruleContent = this.requireParam(params.ruleContent, "ruleContent", "create");
        const { startTime } = this.logStart(`${this.name}.create`, { repositoryId, title });
        try {
          const body: Record<string, unknown> = {
            title,
            rule_content: ruleContent,
          };

          const mappedRuleType = mapPrRuleType(params.ruleType);
          if (mappedRuleType !== "other" || params.ruleType) {
            body.rule_type = mappedRuleType;
          }
          if (params.priority !== undefined) body.priority = params.priority;

          const result = await api.post(`/api/repositories/${repositoryId}/pr-rules`, body);
          this.logSuccess(`${this.name}.create`, { repositoryId, title }, startTime);
          return jsonResponse(result, `✅ Created PR rule for repository: ${repositoryId}`);
        } catch (error) {
          return this.handleError(`${this.name}.create`, error, "Failed to create PR rule", { repositoryId, title }, startTime);
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

          const result = await api.put(`/api/repositories/${repositoryId}/pr-rules/${ruleId}`, body);
          this.logSuccess(`${this.name}.update`, { repositoryId, ruleId }, startTime);
          return jsonResponse(result, `✅ Updated PR rule ${ruleId} for repository: ${repositoryId}`);
        } catch (error) {
          return this.handleError(`${this.name}.update`, error, "Failed to update PR rule", { repositoryId, ruleId }, startTime);
        }
      }
      default:
        return this.handleError(this.name, new Error(`Unknown action: ${params.action}`), `Unknown action`);
    }
  }
}

export const repositoryPrRulesTool = new RepositoryPrRulesTool();
