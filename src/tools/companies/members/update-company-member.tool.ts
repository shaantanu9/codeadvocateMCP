/**
 * Update Company Member Tool
 * 
 * Update a member's role in the company.
 */

import { z } from "zod";
import { BaseToolHandler } from "../../base/tool-handler.base.js";
import { jsonResponse } from "../../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../../base/base-tool.interface.js";
import type { FormattedResponse } from "../../../utils/response-formatter.js";

export interface UpdateCompanyMemberParams {
  companyId: string;
  userId: string;
  role: "admin" | "member" | "viewer";
}

class UpdateCompanyMemberTool extends BaseToolHandler implements BaseToolDefinition<UpdateCompanyMemberParams> {
  name = "updateCompanyMember";
  description = "Update a member's role in the company (requires company admin/owner role)";
  
  paramsSchema = z.object({
    companyId: z.string().describe("The ID of the company"),
    userId: z.string().describe("The ID of the user to update"),
    role: z.enum(["admin", "member", "viewer"]).describe("New role for the member (admin, member, viewer)"),
  });

  async execute(params: UpdateCompanyMemberParams): Promise<FormattedResponse> {
    const { startTime } = this.logStart(this.name, params as unknown as Record<string, unknown>);

    try {
      const apiService = this.getApiService();
      const body: Record<string, unknown> = {
        role: params.role,
      };

      const result = await apiService.patch(`/api/companies/${params.companyId}/members/${params.userId}`, body);
      
      this.logSuccess(this.name, params as unknown as Record<string, unknown>, startTime, {
        success: true,
        message: `Updated member role in company: ${params.companyId}`,
      });
      
      return jsonResponse(result, `✅ Updated member role in company: ${params.companyId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to update company member", params as unknown as Record<string, unknown>, startTime);
    }
  }
}

export const updateCompanyMemberTool = new UpdateCompanyMemberTool();

