/**
 * Unlink Company Repository Tool
 * 
 * Unlink a repository from a company (converts back to personal repo).
 */

import { z } from "zod";
import { BaseToolHandler } from "../../base/tool-handler.base.js";
import { jsonResponse } from "../../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../../base/base-tool.interface.js";
import type { FormattedResponse } from "../../../utils/response-formatter.js";

export interface UnlinkCompanyRepositoryParams {
  companyId: string;
  repositoryId: string;
}

class UnlinkCompanyRepositoryTool extends BaseToolHandler implements BaseToolDefinition<UnlinkCompanyRepositoryParams> {
  name = "unlinkCompanyRepository";
  description = "Unlink a repository from a company (converts back to personal repo, requires company admin/owner role)";
  
  paramsSchema = z.object({
    companyId: z.string().describe("The ID of the company"),
    repositoryId: z.string().describe("The ID of the repository to unlink"),
  });

  async execute(params: UnlinkCompanyRepositoryParams): Promise<FormattedResponse> {
    const { startTime } = this.logStart(this.name, params as Record<string, unknown>);

    try {
      const apiService = this.getApiService();
      const result = await apiService.delete(`/api/companies/${params.companyId}/repositories/${params.repositoryId}`);
      
      this.logSuccess(this.name, params as Record<string, unknown>, startTime, {
        success: true,
        message: `Unlinked repository from company: ${params.companyId}`,
      });
      
      return jsonResponse(result, `✅ Unlinked repository from company: ${params.companyId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to unlink company repository", params as Record<string, unknown>, startTime);
    }
  }
}

export const unlinkCompanyRepositoryTool = new UnlinkCompanyRepositoryTool();

