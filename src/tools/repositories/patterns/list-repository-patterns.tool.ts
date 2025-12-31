/**
 * List Repository Patterns Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../../base/tool-handler.base.js";
import { jsonResponse } from "../../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../../base/base-tool.interface.js";
import type { FormattedResponse } from "../../../utils/response-formatter.js";

export interface ListRepositoryPatternsParams {
  repositoryId: string;
}

class ListRepositoryPatternsTool extends BaseToolHandler implements BaseToolDefinition<ListRepositoryPatternsParams> {
  name = "listRepositoryPatterns";
  description = "List all coding patterns for a repository";
  
  paramsSchema = z.object({
    repositoryId: z.string().describe("The ID of the repository"),
  });

  async execute(params: ListRepositoryPatternsParams): Promise<FormattedResponse> {
    const { startTime } = this.logStart(this.name, params as unknown as Record<string, unknown>);

    try {
      const apiService = this.getApiService();
      const result = await apiService.get(`/api/repositories/${params.repositoryId}/patterns`);
      
      this.logSuccess(this.name, params as unknown as Record<string, unknown>, startTime, {
        success: true,
        message: `Retrieved patterns for repository: ${params.repositoryId}`,
      });
      
      return jsonResponse(result, `✅ Retrieved patterns for repository: ${params.repositoryId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to list repository patterns", params as unknown as Record<string, unknown>, startTime);
    }
  }
}

export const listRepositoryPatternsTool = new ListRepositoryPatternsTool();

