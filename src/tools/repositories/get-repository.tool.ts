/**
 * Get Repository Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface GetRepositoryParams {
  repositoryId: string;
}

class GetRepositoryTool extends BaseToolHandler implements BaseToolDefinition<GetRepositoryParams> {
  name = "getRepository";
  description = "Get a specific repository by ID";
  
  paramsSchema = z.object({
    repositoryId: z.string().describe("The ID of the repository to retrieve"),
  });

  async execute(params: GetRepositoryParams): Promise<FormattedResponse> {
    const { startTime } = this.logStart(this.name, params);

    try {
      const apiService = this.getApiService();
      const result = await apiService.get(`/api/repositories/${params.repositoryId}`);
      
      this.logSuccess(this.name, params, startTime, {
        success: true,
        message: `Retrieved repository: ${params.repositoryId}`,
      });
      
      return jsonResponse(result, `✅ Retrieved repository: ${params.repositoryId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to get repository", params, startTime);
    }
  }
}

export const getRepositoryTool = new GetRepositoryTool();


