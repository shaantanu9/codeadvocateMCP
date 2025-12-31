/**
 * Get Repository Error Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../../base/tool-handler.base.js";
import { jsonResponse } from "../../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../../base/base-tool.interface.js";
import type { FormattedResponse } from "../../../utils/response-formatter.js";

export interface GetRepositoryErrorParams {
  repositoryId: string;
  errorId: string;
}

class GetRepositoryErrorTool extends BaseToolHandler implements BaseToolDefinition<GetRepositoryErrorParams> {
  name = "getRepositoryError";
  description = "Get a specific error log by ID";
  
  paramsSchema = z.object({
    repositoryId: z.string().describe("The ID of the repository"),
    errorId: z.string().describe("The ID of the error"),
  });

  async execute(params: GetRepositoryErrorParams): Promise<FormattedResponse> {
    const { startTime } = this.logStart(this.name, params as unknown as Record<string, unknown>);

    try {
      const apiService = this.getApiService();
      const result = await apiService.get(`/api/repositories/${params.repositoryId}/errors/${params.errorId}`);
      
      this.logSuccess(this.name, params as unknown as Record<string, unknown>, startTime, {
        success: true,
        message: `Retrieved error ${params.errorId} for repository: ${params.repositoryId}`,
      });
      
      return jsonResponse(result, `✅ Retrieved error ${params.errorId} for repository: ${params.repositoryId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to get repository error", params as unknown as Record<string, unknown>, startTime);
    }
  }
}

export const getRepositoryErrorTool = new GetRepositoryErrorTool();

