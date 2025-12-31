/**
 * Delete Repository Learning Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../../base/tool-handler.base.js";
import { jsonResponse } from "../../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../../base/base-tool.interface.js";
import type { FormattedResponse } from "../../../utils/response-formatter.js";

export interface DeleteRepositoryLearningParams {
  repositoryId: string;
  learningId: string;
}

class DeleteRepositoryLearningTool extends BaseToolHandler implements BaseToolDefinition<DeleteRepositoryLearningParams> {
  name = "deleteRepositoryLearning";
  description = "Delete a learning from a repository. This action cannot be undone.";
  
  paramsSchema = z.object({
    repositoryId: z.string().describe("The ID of the repository"),
    learningId: z.string().describe("The ID of the learning to delete"),
  });

  async execute(params: DeleteRepositoryLearningParams): Promise<FormattedResponse> {
    const { startTime } = this.logStart(this.name, { ...params } as Record<string, unknown>);

    try {
      const apiService = this.getApiService();
      const result = await apiService.delete(`/api/repositories/${params.repositoryId}/learnings/${params.learningId}`);
      
      this.logSuccess(this.name, { ...params } as Record<string, unknown>, startTime, {
        success: true,
        message: `Deleted learning ${params.learningId} from repository: ${params.repositoryId}`,
      });
      
      return jsonResponse(result, `✅ Deleted learning ${params.learningId} from repository: ${params.repositoryId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to delete repository learning", { ...params } as Record<string, unknown>, startTime);
    }
  }
}

export const deleteRepositoryLearningTool = new DeleteRepositoryLearningTool();

