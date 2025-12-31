/**
 * Revoke Repository Permission Tool
 * 
 * Revoke permission from a user or company.
 */

import { z } from "zod";
import { BaseToolHandler } from "../../base/tool-handler.base.js";
import { jsonResponse } from "../../../utils/response-formatter.js";
import { buildQueryParams } from "../../../utils/query-params.js";
import type { BaseToolDefinition } from "../../base/base-tool.interface.js";
import type { FormattedResponse } from "../../../utils/response-formatter.js";

export interface RevokeRepositoryPermissionParams {
  repositoryId: string;
  userId?: string;
  companyId?: string;
}

class RevokeRepositoryPermissionTool extends BaseToolHandler implements BaseToolDefinition<RevokeRepositoryPermissionParams> {
  name = "revokeRepositoryPermission";
  description = "Revoke permission from a user or company (requires repository admin access)";
  
  paramsSchema = z.object({
    repositoryId: z.string().describe("The ID of the repository"),
    userId: z.string().optional().describe("The ID of the user (required if companyId not provided)"),
    companyId: z.string().optional().describe("The ID of the company (required if userId not provided)"),
  }).refine(
    (data) => data.userId || data.companyId,
    {
      message: "Either userId or companyId must be provided",
      path: ["userId"],
    }
  );

  async execute(params: RevokeRepositoryPermissionParams): Promise<FormattedResponse> {
    const { startTime } = this.logStart(this.name, params as unknown as Record<string, unknown>);

    try {
      const apiService = this.getApiService();
      
      // Build query params
      const queryParams = buildQueryParams({
        userId: params.userId,
        companyId: params.companyId,
      }, {
        userId: "user_id",
        companyId: "company_id",
      });

      const result = await apiService.delete(`/api/repositories/${params.repositoryId}/permissions`, queryParams);
      
      this.logSuccess(this.name, params as unknown as Record<string, unknown>, startTime, {
        success: true,
        message: `Revoked permission for repository: ${params.repositoryId}`,
      });
      
      return jsonResponse(result, `✅ Revoked permission for repository: ${params.repositoryId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to revoke repository permission", params as unknown as Record<string, unknown>, startTime);
    }
  }
}

export const revokeRepositoryPermissionTool = new RevokeRepositoryPermissionTool();

