/**
 * Get Company Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface GetCompanyParams {
  companyId: string;
}

class GetCompanyTool extends BaseToolHandler implements BaseToolDefinition<GetCompanyParams> {
  name = "getCompany";
  description = "Get a specific company by ID";
  
  paramsSchema = z.object({
    companyId: z.string().describe("The ID of the company to retrieve"),
  });

  async execute(params: GetCompanyParams): Promise<FormattedResponse> {
    const { startTime } = this.logStart(this.name, params as Record<string, unknown>);

    try {
      const apiService = this.getApiService();
      const result = await apiService.get(`/api/companies/${params.companyId}`);
      
      this.logSuccess(this.name, params as Record<string, unknown>, startTime, {
        success: true,
        message: `Retrieved company: ${params.companyId}`,
      });
      
      return jsonResponse(result, `✅ Retrieved company: ${params.companyId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to get company", params as Record<string, unknown>, startTime);
    }
  }
}

export const getCompanyTool = new GetCompanyTool();




