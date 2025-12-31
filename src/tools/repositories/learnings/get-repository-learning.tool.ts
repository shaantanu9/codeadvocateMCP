/**
 * Get Repository Learning Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../../base/tool-handler.base.js";
import { jsonResponse } from "../../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../../base/base-tool.interface.js";
import type { FormattedResponse } from "../../../utils/response-formatter.js";

export interface GetRepositoryLearningParams {
  repositoryId: string;
  learningId: string;
}

class GetRepositoryLearningTool extends BaseToolHandler implements BaseToolDefinition<GetRepositoryLearningParams> {
  name = "getRepositoryLearning";
  description = "Get a specific learning by ID";
  
  paramsSchema = z.object({
    repositoryId: z.string().describe("The ID of the repository"),
    learningId: z.string().describe("The ID of the learning"),
  });

  async execute(params: GetRepositoryLearningParams): Promise<FormattedResponse> {
    const { startTime } = this.logStart(this.name, params as Record<string, unknown>);

    try {
      const apiService = this.getApiService();
      const result = await apiService.get(`/api/repositories/${params.repositoryId}/learnings/${params.learningId}`);
      
      this.logSuccess(this.name, params as Record<string, unknown>, startTime, {
        success: true,
        message: `Retrieved learning ${params.learningId} for repository: ${params.repositoryId}`,
      });
      
      return jsonResponse(result, `✅ Retrieved learning ${params.learningId} for repository: ${params.repositoryId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to get repository learning", params as Record<string, unknown>, startTime);
    }
  }
}

export const getRepositoryLearningTool = new GetRepositoryLearningTool();

