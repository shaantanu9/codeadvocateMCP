/**
 * Invite Company Member Tool
 * 
 * Create an invitation link for a new company member.
 */

import { z } from "zod";
import { BaseToolHandler } from "../../base/tool-handler.base.js";
import { jsonResponse } from "../../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../../base/base-tool.interface.js";
import type { FormattedResponse } from "../../../utils/response-formatter.js";

export interface InviteCompanyMemberParams {
  companyId: string;
  email: string;
}

class InviteCompanyMemberTool extends BaseToolHandler implements BaseToolDefinition<InviteCompanyMemberParams> {
  name = "inviteCompanyMember";
  description = "Create an invitation link for a new company member (requires company admin/owner role)";
  
  paramsSchema = z.object({
    companyId: z.string().describe("The ID of the company"),
    email: z.string().email().describe("Email address of the user to invite"),
  });

  async execute(params: InviteCompanyMemberParams): Promise<FormattedResponse> {
    const { startTime } = this.logStart(this.name, params as Record<string, unknown>);

    try {
      const apiService = this.getApiService();
      const body: Record<string, unknown> = {
        email: params.email,
      };

      const result = await apiService.post(`/api/companies/${params.companyId}/invitations`, body);
      
      this.logSuccess(this.name, params as Record<string, unknown>, startTime, {
        success: true,
        message: `Created invitation for company: ${params.companyId}`,
      });
      
      return jsonResponse(result, `✅ Created invitation for company: ${params.companyId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to invite company member", params as Record<string, unknown>, startTime);
    }
  }
}

export const inviteCompanyMemberTool = new InviteCompanyMemberTool();

