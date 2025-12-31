/**
 * Update Repository Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface UpdateRepositoryParams {
  repositoryId: string;
  name?: string;
  description?: string;
  type?: "individual" | "company";
  companyId?: string;
  isCompanyRepo?: boolean;
}

class UpdateRepositoryTool extends BaseToolHandler implements BaseToolDefinition<UpdateRepositoryParams> {
  name = "updateRepository";
  description = "Update a repository";
  
  paramsSchema = z.object({
    repositoryId: z.string().describe("The ID of the repository to update"),
    name: z.string().optional().describe("Name of the repository"),
    description: z.string().optional().describe("Description of the repository"),
    type: z.enum(["individual", "company"]).optional().describe("Repository type"),
    companyId: z.string().optional().describe("Company ID to link repository to (for linking to company)"),
    isCompanyRepo: z.boolean().optional().describe("Whether the repository is a company repository (true to link, false to unlink)"),
  });

  async execute(params: UpdateRepositoryParams): Promise<FormattedResponse> {
    const { startTime } = this.logStart(this.name, params as unknown as Record<string, unknown>);

    try {
      const apiService = this.getApiService();
      const body: Record<string, unknown> = {};
      if (params.name) body.name = params.name;
      if (params.description) body.description = params.description;
      if (params.type) body.type = params.type;
      if (params.companyId !== undefined) body.company_id = params.companyId;
      if (params.isCompanyRepo !== undefined) body.is_company_repo = params.isCompanyRepo;

      const result = await apiService.patch(`/api/repositories/${params.repositoryId}`, body);
      
      this.logSuccess(this.name, params as unknown as Record<string, unknown>, startTime, {
        success: true,
        message: `Updated repository: ${params.repositoryId}`,
      });
      
      return jsonResponse(result, `✅ Updated repository: ${params.repositoryId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to update repository", params as unknown as Record<string, unknown>, startTime);
    }
  }
}

export const updateRepositoryTool = new UpdateRepositoryTool();


