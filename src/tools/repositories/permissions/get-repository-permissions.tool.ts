/**
 * Get Repository Permissions Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../../base/tool-handler.base.js";
import { jsonResponse } from "../../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../../base/base-tool.interface.js";
import type { FormattedResponse } from "../../../utils/response-formatter.js";

export interface GetRepositoryPermissionsParams {
  repositoryId: string;
}

class GetRepositoryPermissionsTool extends BaseToolHandler implements BaseToolDefinition<GetRepositoryPermissionsParams> {
  name = "getRepositoryPermissions";
  description = "Get permissions for a repository";
  
  paramsSchema = z.object({
    repositoryId: z.string().describe("The ID of the repository"),
  });

  async execute(params: GetRepositoryPermissionsParams): Promise<FormattedResponse> {
    const { startTime } = this.logStart(this.name, params);

    try {
      const apiService = this.getApiService();
      const result = await apiService.get(`/api/repositories/${params.repositoryId}/permissions`);
      
      this.logSuccess(this.name, params, startTime, {
        success: true,
        message: `Retrieved permissions for repository: ${params.repositoryId}`,
      });
      
      return jsonResponse(result, `✅ Retrieved permissions for repository: ${params.repositoryId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to get repository permissions", params, startTime);
    }
  }
}

export const getRepositoryPermissionsTool = new GetRepositoryPermissionsTool();

