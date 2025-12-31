/**
 * List Repository Prompts Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../../base/tool-handler.base.js";
import { jsonResponse } from "../../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../../base/base-tool.interface.js";
import type { FormattedResponse } from "../../../utils/response-formatter.js";

export interface ListRepositoryPromptsParams {
  repositoryId: string;
  search?: string;
  promptType?: string;
  category?: string;
  page?: number;
  limit?: number;
}

class ListRepositoryPromptsTool extends BaseToolHandler implements BaseToolDefinition<ListRepositoryPromptsParams> {
  name = "listRepositoryPrompts";
  description = "List prompts for a repository";
  
  paramsSchema = z.object({
    repositoryId: z.string().describe("The ID of the repository"),
    search: z.string().optional().describe("Search term to filter prompts"),
    promptType: z.string().optional().describe("Filter by prompt type"),
    category: z.string().optional().describe("Filter by category"),
    page: z.number().optional().default(1).describe("Page number for pagination"),
    limit: z.number().optional().default(20).describe("Number of items per page"),
  });

  async execute(params: ListRepositoryPromptsParams): Promise<FormattedResponse> {
    const { startTime } = this.logStart(this.name, params);

    try {
      const apiService = this.getApiService();
      const queryParams: Record<string, string | number> = {};
      if (params.search) queryParams.search = params.search;
      if (params.promptType) queryParams.prompt_type = params.promptType;
      if (params.category) queryParams.category = params.category;
      if (params.page) queryParams.page = params.page;
      if (params.limit) queryParams.limit = params.limit;

      const result = await apiService.get(`/api/repositories/${params.repositoryId}/prompts`, queryParams);
      
      this.logSuccess(this.name, params, startTime, {
        success: true,
        message: `Retrieved prompts for repository: ${params.repositoryId}`,
      });
      
      return jsonResponse(result, `✅ Retrieved prompts for repository: ${params.repositoryId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to list repository prompts", params, startTime);
    }
  }
}

export const listRepositoryPromptsTool = new ListRepositoryPromptsTool();


