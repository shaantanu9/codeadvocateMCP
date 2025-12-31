/**
 * Get Repository File Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../../base/tool-handler.base.js";
import { jsonResponse } from "../../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../../base/base-tool.interface.js";
import type { FormattedResponse } from "../../../utils/response-formatter.js";

export interface GetRepositoryFileParams {
  repositoryId: string;
  fileId: string;
}

class GetRepositoryFileTool extends BaseToolHandler implements BaseToolDefinition<GetRepositoryFileParams> {
  name = "getRepositoryFile";
  description = "Get a specific file for a repository";
  
  paramsSchema = z.object({
    repositoryId: z.string().describe("The ID of the repository"),
    fileId: z.string().describe("The ID of the file"),
  });

  async execute(params: GetRepositoryFileParams): Promise<FormattedResponse> {
    const { startTime } = this.logStart(this.name, params);

    try {
      const apiService = this.getApiService();
      const result = await apiService.get(`/api/repositories/${params.repositoryId}/files/${params.fileId}`);
      
      this.logSuccess(this.name, params, startTime, {
        success: true,
        message: `Retrieved file ${params.fileId} for repository: ${params.repositoryId}`,
      });
      
      return jsonResponse(result, `✅ Retrieved file ${params.fileId} for repository: ${params.repositoryId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to get repository file", params, startTime);
    }
  }
}

export const getRepositoryFileTool = new GetRepositoryFileTool();

