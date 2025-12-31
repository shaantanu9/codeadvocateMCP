/**
 * Create Company Repository Tool
 * 
 * Create a new repository directly linked to a company.
 */

import { z } from "zod";
import { BaseToolHandler } from "../../base/tool-handler.base.js";
import { jsonResponse } from "../../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../../base/base-tool.interface.js";
import type { FormattedResponse } from "../../../utils/response-formatter.js";

export interface CreateCompanyRepositoryParams {
  companyId: string;
  name: string;
  slug?: string;
  description?: string;
  isPrivate?: boolean;
}

class CreateCompanyRepositoryTool extends BaseToolHandler implements BaseToolDefinition<CreateCompanyRepositoryParams> {
  name = "createCompanyRepository";
  description = "Create a new repository directly linked to a company (requires company admin/owner role)";
  
  paramsSchema = z.object({
    companyId: z.string().describe("The ID of the company"),
    name: z.string().describe("Name of the repository"),
    slug: z.string().optional().describe("URL-friendly slug for the repository"),
    description: z.string().optional().describe("Description of the repository"),
    isPrivate: z.boolean().optional().default(false).describe("Whether the repository is private"),
  });

  async execute(params: CreateCompanyRepositoryParams): Promise<FormattedResponse> {
    const { startTime } = this.logStart(this.name, params as Record<string, unknown>);

    try {
      const apiService = this.getApiService();
      const body: Record<string, unknown> = {
        name: params.name,
        is_private: params.isPrivate ?? false,
      };
      if (params.slug) body.slug = params.slug;
      if (params.description) body.description = params.description;

      const result = await apiService.post(`/api/companies/${params.companyId}/repositories`, body);
      
      this.logSuccess(this.name, params as Record<string, unknown>, startTime, {
        success: true,
        message: `Created repository for company: ${params.companyId}`,
      });
      
      return jsonResponse(result, `✅ Created repository for company: ${params.companyId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to create company repository", params as Record<string, unknown>, startTime);
    }
  }
}

export const createCompanyRepositoryTool = new CreateCompanyRepositoryTool();

