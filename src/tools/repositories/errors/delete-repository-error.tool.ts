/**
 * Delete Repository Error Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../../base/tool-handler.base.js";
import { jsonResponse } from "../../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../../base/base-tool.interface.js";
import type { FormattedResponse } from "../../../utils/response-formatter.js";

export interface DeleteRepositoryErrorParams {
  repositoryId: string;
  errorId: string;
}

class DeleteRepositoryErrorTool extends BaseToolHandler implements BaseToolDefinition<DeleteRepositoryErrorParams> {
  name = "deleteRepositoryError";
  description = "Delete an error log from a repository. This action cannot be undone.";
  
  paramsSchema = z.object({
    repositoryId: z.string().describe("The ID of the repository"),
    errorId: z.string().describe("The ID of the error to delete"),
  });

  async execute(params: DeleteRepositoryErrorParams): Promise<FormattedResponse> {
    const { startTime } = this.logStart(this.name, { ...params } as Record<string, unknown>);

    try {
      const apiService = this.getApiService();
      const result = await apiService.delete(`/api/repositories/${params.repositoryId}/errors/${params.errorId}`);
      
      this.logSuccess(this.name, { ...params } as Record<string, unknown>, startTime, {
        success: true,
        message: `Deleted error ${params.errorId} from repository: ${params.repositoryId}`,
      });
      
      return jsonResponse(result, `✅ Deleted error ${params.errorId} from repository: ${params.repositoryId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to delete repository error", { ...params } as Record<string, unknown>, startTime);
    }
  }
}

export const deleteRepositoryErrorTool = new DeleteRepositoryErrorTool();

