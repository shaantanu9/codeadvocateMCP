/**
 * List Company Members Tool
 * 
 * Get all active members of a company.
 */

import { z } from "zod";
import { BaseToolHandler } from "../../base/tool-handler.base.js";
import { jsonResponse } from "../../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../../base/base-tool.interface.js";
import type { FormattedResponse } from "../../../utils/response-formatter.js";

export interface ListCompanyMembersParams {
  companyId: string;
}

class ListCompanyMembersTool extends BaseToolHandler implements BaseToolDefinition<ListCompanyMembersParams> {
  name = "listCompanyMembers";
  description = "Get all active members of a company";
  
  paramsSchema = z.object({
    companyId: z.string().describe("The ID of the company"),
  });

  async execute(params: ListCompanyMembersParams): Promise<FormattedResponse> {
    const { startTime } = this.logStart(this.name, params as unknown as Record<string, unknown>);

    try {
      const apiService = this.getApiService();
      const result = await apiService.get(`/api/companies/${params.companyId}/members`);
      
      this.logSuccess(this.name, params as unknown as Record<string, unknown>, startTime, {
        success: true,
        message: `Retrieved members for company: ${params.companyId}`,
      });
      
      return jsonResponse(result, `✅ Retrieved members for company: ${params.companyId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to list company members", params as unknown as Record<string, unknown>, startTime);
    }
  }
}

export const listCompanyMembersTool = new ListCompanyMembersTool();

