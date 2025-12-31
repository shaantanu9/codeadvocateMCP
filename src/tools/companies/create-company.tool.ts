/**
 * Create Company Tool
 * 
 * Create a new company.
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface CreateCompanyParams {
  name: string;
  slug?: string;
  description?: string;
  website?: string;
  logoUrl?: string;
}

class CreateCompanyTool extends BaseToolHandler implements BaseToolDefinition<CreateCompanyParams> {
  name = "createCompany";
  description = "Create a new company";
  
  paramsSchema = z.object({
    name: z.string().describe("Name of the company"),
    slug: z.string().optional().describe("URL-friendly slug for the company"),
    description: z.string().optional().describe("Description of the company"),
    website: z.string().url().optional().describe("Company website URL"),
    logoUrl: z.string().url().optional().describe("Company logo URL"),
  });

  async execute(params: CreateCompanyParams): Promise<FormattedResponse> {
    const { startTime } = this.logStart(this.name, params as unknown as Record<string, unknown>);

    try {
      const apiService = this.getApiService();
      const body: Record<string, unknown> = { name: params.name };
      if (params.slug) body.slug = params.slug;
      if (params.description) body.description = params.description;
      if (params.website) body.website = params.website;
      if (params.logoUrl) body.logo_url = params.logoUrl;

      const result = await apiService.post("/api/companies", body);
      
      this.logSuccess(this.name, params as unknown as Record<string, unknown>, startTime, {
        success: true,
        message: `Created company: ${params.name}`,
      });
      
      return jsonResponse(result, `✅ Created company: ${params.name}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to create company", params as unknown as Record<string, unknown>, startTime);
    }
  }
}

export const createCompanyTool = new CreateCompanyTool();

