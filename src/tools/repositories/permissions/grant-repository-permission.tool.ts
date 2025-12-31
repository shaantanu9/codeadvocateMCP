/**
 * Grant Repository Permission Tool
 * 
 * Grant permission to a user or company for a repository.
 */

import { z } from "zod";
import { BaseToolHandler } from "../../base/tool-handler.base.js";
import { jsonResponse } from "../../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../../base/base-tool.interface.js";
import type { FormattedResponse } from "../../../utils/response-formatter.js";

export interface GrantRepositoryPermissionParams {
  repositoryId: string;
  userId?: string;
  companyId?: string;
  permission: "read" | "write" | "admin";
}

class GrantRepositoryPermissionTool extends BaseToolHandler implements BaseToolDefinition<GrantRepositoryPermissionParams> {
  name = "grantRepositoryPermission";
  description = "Grant permission to a user or company for a repository (requires repository admin access)";
  
  paramsSchema = z.object({
    repositoryId: z.string().describe("The ID of the repository"),
    userId: z.string().optional().describe("The ID of the user (required if companyId not provided)"),
    companyId: z.string().optional().describe("The ID of the company (required if userId not provided)"),
    permission: z.enum(["read", "write", "admin"]).describe("Permission level (read, write, admin)"),
  }).refine(
    (data) => data.userId || data.companyId,
    {
      message: "Either userId or companyId must be provided",
      path: ["userId"],
    }
  );

  async execute(params: GrantRepositoryPermissionParams): Promise<FormattedResponse> {
    const { startTime } = this.logStart(this.name, params as unknown as Record<string, unknown>);

    try {
      const apiService = this.getApiService();
      const body: Record<string, unknown> = {
        permission: params.permission,
      };
      if (params.userId) body.user_id = params.userId;
      if (params.companyId) body.company_id = params.companyId;

      const result = await apiService.post(`/api/repositories/${params.repositoryId}/permissions`, body);
      
      this.logSuccess(this.name, params as unknown as Record<string, unknown>, startTime, {
        success: true,
        message: `Granted permission for repository: ${params.repositoryId}`,
      });
      
      return jsonResponse(result, `✅ Granted permission for repository: ${params.repositoryId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to grant repository permission", params as unknown as Record<string, unknown>, startTime);
    }
  }
}

export const grantRepositoryPermissionTool = new GrantRepositoryPermissionTool();

