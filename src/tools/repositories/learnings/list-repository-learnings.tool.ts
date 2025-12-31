/**
 * List Repository Learnings Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../../base/tool-handler.base.js";
import { jsonResponse } from "../../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../../base/base-tool.interface.js";
import type { FormattedResponse } from "../../../utils/response-formatter.js";

export interface ListRepositoryLearningsParams {
  repositoryId: string;
}

class ListRepositoryLearningsTool extends BaseToolHandler implements BaseToolDefinition<ListRepositoryLearningsParams> {
  name = "listRepositoryLearnings";
  description = "List all learnings for a repository";
  
  paramsSchema = z.object({
    repositoryId: z.string().describe("The ID of the repository"),
  });

  async execute(params: ListRepositoryLearningsParams): Promise<FormattedResponse> {
    const { startTime } = this.logStart(this.name, params as Record<string, unknown>);

    try {
      const apiService = this.getApiService();
      const result = await apiService.get(`/api/repositories/${params.repositoryId}/learnings`);
      
      this.logSuccess(this.name, params as Record<string, unknown>, startTime, {
        success: true,
        message: `Retrieved learnings for repository: ${params.repositoryId}`,
      });
      
      return jsonResponse(result, `✅ Retrieved learnings for repository: ${params.repositoryId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to list repository learnings", params as Record<string, unknown>, startTime);
    }
  }
}

export const listRepositoryLearningsTool = new ListRepositoryLearningsTool();

