/**
 * Update Repository Error Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../../base/tool-handler.base.js";
import { jsonResponse } from "../../../utils/response-formatter.js";
import { AppError } from "../../../core/errors.js";
import type { BaseToolDefinition } from "../../base/base-tool.interface.js";
import type { FormattedResponse } from "../../../utils/response-formatter.js";

export interface UpdateRepositoryErrorParams {
  repositoryId: string;
  errorId: string;
  errorName?: string;
  errorMessage?: string;
  context?: string;
  rootCause?: string;
  solution?: string;
  learning?: string;
  prevention?: string;
  severity?: "low" | "medium" | "high" | "critical";
  status?: "new" | "investigating" | "resolved" | "recurring";
  tags?: string[];
}

class UpdateRepositoryErrorTool extends BaseToolHandler implements BaseToolDefinition<UpdateRepositoryErrorParams> {
  name = "updateRepositoryError";
  description = "Update an error log for a repository";
  
  paramsSchema = z.object({
    repositoryId: z.string().describe("The ID of the repository"),
    errorId: z.string().describe("The ID of the error"),
    errorName: z.string().optional().describe("Name/title of the error"),
    errorMessage: z.string().optional().describe("The actual error message"),
    context: z.string().optional().describe("Where/when error occurred"),
    rootCause: z.string().optional().describe("Why the error happened"),
    solution: z.string().optional().describe("How it was fixed"),
    learning: z.string().optional().describe("What was learned"),
    prevention: z.string().optional().describe("How to prevent it"),
    severity: z.enum(["low", "medium", "high", "critical"]).optional().describe("Error severity"),
    status: z.enum(["new", "investigating", "resolved", "recurring"]).optional().describe("Current status"),
    tags: z.array(z.string()).optional().describe("Array of tags"),
  });

  async execute(params: UpdateRepositoryErrorParams): Promise<FormattedResponse> {
    const { startTime } = this.logStart(this.name, { ...params } as Record<string, unknown>);

    try {
      const apiService = this.getApiService();
      const body: Record<string, unknown> = {};

      if (params.errorName !== undefined) body.error_name = params.errorName;
      if (params.errorMessage !== undefined) body.error_message = params.errorMessage;
      if (params.context !== undefined) body.context = params.context;
      if (params.rootCause !== undefined) body.root_cause = params.rootCause;
      if (params.solution !== undefined) body.solution = params.solution;
      if (params.learning !== undefined) body.learning = params.learning;
      if (params.prevention !== undefined) body.prevention = params.prevention;
      if (params.severity !== undefined) body.severity = params.severity;
      if (params.status !== undefined) body.status = params.status;
      if (params.tags !== undefined) body.tags = params.tags;

      // Ensure at least one field is provided
      if (Object.keys(body).length === 0) {
        throw new AppError("At least one field must be provided for update", "NO_FIELDS");
      }

      const result = await apiService.patch(`/api/repositories/${params.repositoryId}/errors/${params.errorId}`, body);
      
      this.logSuccess(this.name, { ...params } as Record<string, unknown>, startTime, {
        success: true,
        message: `Updated error ${params.errorId} for repository: ${params.repositoryId}`,
      });
      
      return jsonResponse(result, `✅ Updated error ${params.errorId} for repository: ${params.repositoryId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to update repository error", { ...params } as Record<string, unknown>, startTime);
    }
  }
}

export const updateRepositoryErrorTool = new UpdateRepositoryErrorTool();

