/**
 * Get Repository Pattern Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../../base/tool-handler.base.js";
import { jsonResponse } from "../../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../../base/base-tool.interface.js";
import type { FormattedResponse } from "../../../utils/response-formatter.js";

export interface GetRepositoryPatternParams {
  repositoryId: string;
  patternId: string;
}

class GetRepositoryPatternTool extends BaseToolHandler implements BaseToolDefinition<GetRepositoryPatternParams> {
  name = "getRepositoryPattern";
  description = "Get a specific coding pattern by ID";
  
  paramsSchema = z.object({
    repositoryId: z.string().describe("The ID of the repository"),
    patternId: z.string().describe("The ID of the pattern"),
  });

  async execute(params: GetRepositoryPatternParams): Promise<FormattedResponse> {
    const { startTime } = this.logStart(this.name, params as Record<string, unknown>);

    try {
      const apiService = this.getApiService();
      const result = await apiService.get(`/api/repositories/${params.repositoryId}/patterns/${params.patternId}`);
      
      this.logSuccess(this.name, params as Record<string, unknown>, startTime, {
        success: true,
        message: `Retrieved pattern ${params.patternId} for repository: ${params.repositoryId}`,
      });
      
      return jsonResponse(result, `✅ Retrieved pattern ${params.patternId} for repository: ${params.repositoryId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to get repository pattern", params as Record<string, unknown>, startTime);
    }
  }
}

export const getRepositoryPatternTool = new GetRepositoryPatternTool();

