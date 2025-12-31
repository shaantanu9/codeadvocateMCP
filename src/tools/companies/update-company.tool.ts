/**
 * Update Company Tool
 * 
 * Update an existing company.
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface UpdateCompanyParams {
  companyId: string;
  name?: string;
  slug?: string;
  description?: string;
  website?: string;
  logoUrl?: string;
}

class UpdateCompanyTool extends BaseToolHandler implements BaseToolDefinition<UpdateCompanyParams> {
  name = "updateCompany";
  description = "Update an existing company";
  
  paramsSchema = z.object({
    companyId: z.string().describe("The ID of the company to update"),
    name: z.string().optional().describe("Name of the company"),
    slug: z.string().optional().describe("URL-friendly slug for the company"),
    description: z.string().optional().describe("Description of the company"),
    website: z.string().url().optional().describe("Company website URL"),
    logoUrl: z.string().url().optional().describe("Company logo URL"),
  });

  async execute(params: UpdateCompanyParams): Promise<FormattedResponse> {
    const { startTime } = this.logStart(this.name, params as unknown as Record<string, unknown>);

    try {
      const apiService = this.getApiService();
      const body: Record<string, unknown> = {};
      if (params.name) body.name = params.name;
      if (params.slug) body.slug = params.slug;
      if (params.description) body.description = params.description;
      if (params.website) body.website = params.website;
      if (params.logoUrl) body.logo_url = params.logoUrl;

      const result = await apiService.patch(`/api/companies/${params.companyId}`, body);
      
      this.logSuccess(this.name, params as unknown as Record<string, unknown>, startTime, {
        success: true,
        message: `Updated company: ${params.companyId}`,
      });
      
      return jsonResponse(result, `✅ Updated company: ${params.companyId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to update company", params as unknown as Record<string, unknown>, startTime);
    }
  }
}

export const updateCompanyTool = new UpdateCompanyTool();

