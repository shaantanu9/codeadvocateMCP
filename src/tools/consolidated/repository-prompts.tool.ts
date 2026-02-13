/**
 * Consolidated Repository Prompts Tool
 *
 * Combines all repository prompt operations into a single tool with an action parameter.
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
  promptId?: string;
  title?: string;
  promptContent?: string;
  promptType?: string;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * Map user-friendly prompt type to API enum value
 */
function mapPromptType(userType: string | undefined): string {
  if (!userType) return "other";

  const mapping: Record<string, string> = {
    development: "code_generation",
    review: "code_review",
    documentation: "documentation",
    refactor: "refactoring",
    test: "testing",
    debug: "debugging",
    explain: "explanation",
    // Direct API values pass through
    code_generation: "code_generation",
    code_review: "code_review",
    refactoring: "refactoring",
    testing: "testing",
    debugging: "debugging",
    explanation: "explanation",
  };

  return mapping[userType.toLowerCase()] || "other";
}

class RepositoryPromptsTool extends BaseToolHandler implements BaseToolDefinition<Params> {
  name = "repositoryPrompts";

  description = `Manage repository prompts. Use 'action' to specify operation:
- list: List prompts (requires: repositoryId; optional: search, promptType, category, page, limit)
- get: Get prompt by ID (requires: repositoryId, promptId)
- create: Create new prompt (requires: repositoryId, title, promptContent; optional: promptType, category)
- update: Update prompt (requires: repositoryId, promptId; optional: title, promptContent, promptType, category)`;

  paramsSchema = z.object({
    action: z.enum(ACTIONS).describe("Operation to perform"),
    repositoryId: z.string().optional().describe("Repository ID. Required for all actions."),
    promptId: z.string().optional().describe("Prompt ID. Required for: get, update"),
    title: z.string().optional().describe("Prompt title. Required for: create"),
    promptContent: z.string().optional().describe("Prompt content. Required for: create"),
    promptType: z.string().optional().describe("Prompt type. User-friendly values: development (maps to code_generation), review (maps to code_review), refactor (maps to refactoring), test (maps to testing), debug (maps to debugging), explain (maps to explanation)"),
    category: z.string().optional().describe("Category (optional, can be any string value)"),
    search: z.string().optional().describe("Search term to filter prompts"),
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
              promptType: params.promptType,
              category: params.category,
            },
            {
              promptType: "prompt_type",
            }
          );
          const result = await api.get(`/api/repositories/${repositoryId}/prompts`, queryParams);
          this.logSuccess(`${this.name}.list`, { repositoryId }, startTime);
          return jsonResponse(result, `✅ Retrieved prompts for repository: ${repositoryId}`);
        } catch (error) {
          return this.handleError(`${this.name}.list`, error, "Failed to list prompts", { repositoryId }, startTime);
        }
      }
      case "get": {
        const repositoryId = this.requireParam(params.repositoryId, "repositoryId", "get");
        const promptId = this.requireParam(params.promptId, "promptId", "get");
        const { startTime } = this.logStart(`${this.name}.get`, { repositoryId, promptId });
        try {
          const result = await api.get(`/api/repositories/${repositoryId}/prompts/${promptId}`);
          this.logSuccess(`${this.name}.get`, { repositoryId, promptId }, startTime);
          return jsonResponse(result, `✅ Retrieved prompt ${promptId} for repository: ${repositoryId}`);
        } catch (error) {
          return this.handleError(`${this.name}.get`, error, "Failed to get prompt", { repositoryId, promptId }, startTime);
        }
      }
      case "create": {
        const repositoryId = this.requireParam(params.repositoryId, "repositoryId", "create");
        const title = this.requireParam(params.title, "title", "create");
        const promptContent = this.requireParam(params.promptContent, "promptContent", "create");
        const { startTime } = this.logStart(`${this.name}.create`, { repositoryId, title });
        try {
          const body: Record<string, unknown> = {
            title,
            prompt_text: promptContent,
          };

          const mappedPromptType = mapPromptType(params.promptType);
          if (mappedPromptType !== "other" || params.promptType) {
            body.prompt_type = mappedPromptType;
          }
          if (params.category !== undefined) body.category = params.category;

          const result = await api.post(`/api/repositories/${repositoryId}/prompts`, body);
          this.logSuccess(`${this.name}.create`, { repositoryId, title }, startTime);
          return jsonResponse(result, `✅ Created prompt for repository: ${repositoryId}`);
        } catch (error) {
          return this.handleError(`${this.name}.create`, error, "Failed to create prompt", { repositoryId, title }, startTime);
        }
      }
      case "update": {
        const repositoryId = this.requireParam(params.repositoryId, "repositoryId", "update");
        const promptId = this.requireParam(params.promptId, "promptId", "update");
        const { startTime } = this.logStart(`${this.name}.update`, { repositoryId, promptId });
        try {
          const body: Record<string, unknown> = {};
          if (params.title !== undefined) body.title = params.title;
          if (params.promptContent !== undefined) body.prompt_content = params.promptContent;
          if (params.promptType !== undefined) body.prompt_type = params.promptType;
          if (params.category !== undefined) body.category = params.category;

          const result = await api.put(`/api/repositories/${repositoryId}/prompts/${promptId}`, body);
          this.logSuccess(`${this.name}.update`, { repositoryId, promptId }, startTime);
          return jsonResponse(result, `✅ Updated prompt ${promptId} for repository: ${repositoryId}`);
        } catch (error) {
          return this.handleError(`${this.name}.update`, error, "Failed to update prompt", { repositoryId, promptId }, startTime);
        }
      }
      default:
        return this.handleError(this.name, new Error(`Unknown action: ${params.action}`), `Unknown action`);
    }
  }
}

export const repositoryPromptsTool = new RepositoryPromptsTool();
