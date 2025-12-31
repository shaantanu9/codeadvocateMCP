/**
 * List Repository Errors Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../../base/tool-handler.base.js";
import { jsonResponse } from "../../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../../base/base-tool.interface.js";
import type { FormattedResponse } from "../../../utils/response-formatter.js";

export interface ListRepositoryErrorsParams {
  repositoryId: string;
}

class ListRepositoryErrorsTool extends BaseToolHandler implements BaseToolDefinition<ListRepositoryErrorsParams> {
  name = "listRepositoryErrors";
  description = "List all errors for a repository";
  
  paramsSchema = z.object({
    repositoryId: z.string().describe("The ID of the repository"),
  });

  async execute(params: ListRepositoryErrorsParams): Promise<FormattedResponse> {
    const { startTime } = this.logStart(this.name, params as Record<string, unknown>);

    try {
      const apiService = this.getApiService();
      const result = await apiService.get(`/api/repositories/${params.repositoryId}/errors`);
      
      this.logSuccess(this.name, params as Record<string, unknown>, startTime, {
        success: true,
        message: `Retrieved errors for repository: ${params.repositoryId}`,
      });
      
      return jsonResponse(result, `✅ Retrieved errors for repository: ${params.repositoryId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to list repository errors", params as Record<string, unknown>, startTime);
    }
  }
}

export const listRepositoryErrorsTool = new ListRepositoryErrorsTool();

