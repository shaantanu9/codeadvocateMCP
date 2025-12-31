/**
 * Create Repository Error Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../../base/tool-handler.base.js";
import { jsonResponse } from "../../../utils/response-formatter.js";
import { logger } from "../../../core/logger.js";
import { processTags } from "../../../utils/tag-filter.js";
import type { BaseToolDefinition } from "../../base/base-tool.interface.js";
import type { FormattedResponse } from "../../../utils/response-formatter.js";

export interface CreateRepositoryErrorParams {
  repositoryId?: string;
  errorName: string;
  errorMessage: string;
  context?: string;
  rootCause?: string;
  solution?: string;
  learning?: string;
  prevention?: string;
  severity?: "low" | "medium" | "high" | "critical";
  status?: "new" | "investigating" | "resolved" | "recurring";
  tags?: string[];
}

class CreateRepositoryErrorTool extends BaseToolHandler implements BaseToolDefinition<CreateRepositoryErrorParams> {
  name = "createRepositoryError";
  description = "Create a new error log for a repository. If repositoryId is not provided, it will be auto-detected from the current workspace (git remote URL or workspace name).";
  
  paramsSchema = z.object({
    repositoryId: z.string().optional().describe("The ID of the repository. If not provided, will be auto-detected from workspace context (git remote URL or workspace name)."),
    errorName: z.string().describe("Name/title of the error"),
    errorMessage: z.string().describe("The actual error message"),
    context: z.string().optional().describe("Where/when error occurred"),
    rootCause: z.string().optional().describe("Why the error happened"),
    solution: z.string().optional().describe("How it was fixed"),
    learning: z.string().optional().describe("What was learned"),
    prevention: z.string().optional().describe("How to prevent it"),
    severity: z.enum(["low", "medium", "high", "critical"]).optional().default("medium").describe("Error severity"),
    status: z.enum(["new", "investigating", "resolved", "recurring"]).optional().default("resolved").describe("Current status"),
    tags: z.array(z.string()).optional().default([]).describe("Array of tags"),
  });

  async execute(params: CreateRepositoryErrorParams): Promise<FormattedResponse> {
    const { startTime } = this.logStart(this.name, { ...params } as Record<string, unknown>);

    try {
      const apiService = this.getApiService();
      
      // Auto-detect repository ID if not provided
      const repositoryId = await this.resolveRepositoryId(params.repositoryId);

      const body: Record<string, unknown> = {
        error_name: params.errorName,
        error_message: params.errorMessage,
      };

      if (params.context !== undefined) body.context = params.context;
      if (params.rootCause !== undefined) body.root_cause = params.rootCause;
      if (params.solution !== undefined) body.solution = params.solution;
      if (params.learning !== undefined) body.learning = params.learning;
      if (params.prevention !== undefined) body.prevention = params.prevention;
      if (params.severity !== undefined) body.severity = params.severity;
      if (params.status !== undefined) body.status = params.status;
      
      // Filter and process tags to remove IDs
      const filteredTags = processTags(params.tags, repositoryId);
      if (filteredTags.length > 0) body.tags = filteredTags;

      logger.debug(`[${this.name}] Preparing API request`, {
        endpoint: `/api/repositories/${repositoryId}/errors`,
        method: "POST",
        body: {
          error_name: body.error_name,
          error_message_length: typeof body.error_message === "string" ? body.error_message.length : 0,
          severity: body.severity || "medium",
          status: body.status || "resolved",
          tags_count: Array.isArray(body.tags) ? body.tags.length : 0,
        },
        repositoryId,
      });

      const result = await apiService.post(`/api/repositories/${repositoryId}/errors`, body);
      
      this.logSuccess(this.name, { ...params, repositoryId } as Record<string, unknown>, startTime, {
        success: true,
        message: `Created error log for repository: ${repositoryId}`,
      });
      
      return jsonResponse(result, `✅ Created error log for repository: ${repositoryId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to create repository error", { ...params } as Record<string, unknown>, startTime);
    }
  }
}

export const createRepositoryErrorTool = new CreateRepositoryErrorTool();

