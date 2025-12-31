/**
 * Get Repository Analysis Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../../base/tool-handler.base.js";
import { jsonResponse } from "../../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../../base/base-tool.interface.js";
import type { FormattedResponse } from "../../../utils/response-formatter.js";

export interface GetRepositoryAnalysisParams {
  repositoryId: string;
}

class GetRepositoryAnalysisTool extends BaseToolHandler implements BaseToolDefinition<GetRepositoryAnalysisParams> {
  name = "getRepositoryAnalysis";
  description = "Get analysis for a repository";
  
  paramsSchema = z.object({
    repositoryId: z.string().describe("The ID of the repository"),
  });

  async execute(params: GetRepositoryAnalysisParams): Promise<FormattedResponse> {
    const { startTime } = this.logStart(this.name, params);

    try {
      const apiService = this.getApiService();
      const result = await apiService.get(`/api/repositories/${params.repositoryId}/analysis`);
      
      this.logSuccess(this.name, params, startTime, {
        success: true,
        message: `Retrieved analysis for repository: ${params.repositoryId}`,
      });
      
      return jsonResponse(result, `✅ Retrieved analysis for repository: ${params.repositoryId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to get repository analysis", params, startTime);
    }
  }
}

export const getRepositoryAnalysisTool = new GetRepositoryAnalysisTool();

