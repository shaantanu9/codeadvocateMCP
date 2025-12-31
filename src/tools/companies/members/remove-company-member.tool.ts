/**
 * Remove Company Member Tool
 * 
 * Remove a member from the company.
 */

import { z } from "zod";
import { BaseToolHandler } from "../../base/tool-handler.base.js";
import { jsonResponse } from "../../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../../base/base-tool.interface.js";
import type { FormattedResponse } from "../../../utils/response-formatter.js";

export interface RemoveCompanyMemberParams {
  companyId: string;
  userId: string;
}

class RemoveCompanyMemberTool extends BaseToolHandler implements BaseToolDefinition<RemoveCompanyMemberParams> {
  name = "removeCompanyMember";
  description = "Remove a member from the company (requires company admin/owner role, cannot remove owner)";
  
  paramsSchema = z.object({
    companyId: z.string().describe("The ID of the company"),
    userId: z.string().describe("The ID of the user to remove"),
  });

  async execute(params: RemoveCompanyMemberParams): Promise<FormattedResponse> {
    const { startTime } = this.logStart(this.name, params as unknown as Record<string, unknown>);

    try {
      const apiService = this.getApiService();
      const result = await apiService.delete(`/api/companies/${params.companyId}/members/${params.userId}`);
      
      this.logSuccess(this.name, params as unknown as Record<string, unknown>, startTime, {
        success: true,
        message: `Removed member from company: ${params.companyId}`,
      });
      
      return jsonResponse(result, `✅ Removed member from company: ${params.companyId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to remove company member", params as unknown as Record<string, unknown>, startTime);
    }
  }
}

export const removeCompanyMemberTool = new RemoveCompanyMemberTool();

