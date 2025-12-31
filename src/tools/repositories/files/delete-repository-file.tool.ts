/**
 * Delete Repository File Tool
 * 
 * Delete a file from a repository.
 * Based on API: DELETE /api/repositories/{repositoryId}/files/{fileId}
 */

import { z } from "zod";
import { BaseToolHandler } from "../../base/tool-handler.base.js";
import { jsonResponse } from "../../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../../base/base-tool.interface.js";
import type { FormattedResponse } from "../../../utils/response-formatter.js";

export interface DeleteRepositoryFileParams {
  repositoryId: string;
  fileId: string;
}

class DeleteRepositoryFileTool extends BaseToolHandler implements BaseToolDefinition<DeleteRepositoryFileParams> {
  name = "deleteRepositoryFile";
  description = "Delete a file from a repository. This action cannot be undone.";
  
  paramsSchema = z.object({
    repositoryId: z.string().describe("The ID of the repository"),
    fileId: z.string().describe("The ID of the file to delete"),
  });

  async execute(params: DeleteRepositoryFileParams): Promise<FormattedResponse> {
    const { startTime } = this.logStart(this.name, { ...params } as Record<string, unknown>);

    try {
      const apiService = this.getApiService();
      const result = await apiService.delete(`/api/repositories/${params.repositoryId}/files/${params.fileId}`);
      
      this.logSuccess(this.name, { ...params } as Record<string, unknown>, startTime, {
        success: true,
        message: `Deleted file ${params.fileId} from repository: ${params.repositoryId}`,
      });
      
      return jsonResponse(result, `✅ Deleted file ${params.fileId} from repository: ${params.repositoryId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to delete repository file", { ...params } as Record<string, unknown>, startTime);
    }
  }
}

export const deleteRepositoryFileTool = new DeleteRepositoryFileTool();

