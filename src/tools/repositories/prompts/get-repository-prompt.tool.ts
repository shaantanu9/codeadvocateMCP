/**
 * Get Repository Prompt Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../../base/tool-handler.base.js";
import { jsonResponse } from "../../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../../base/base-tool.interface.js";
import type { FormattedResponse } from "../../../utils/response-formatter.js";

export interface GetRepositoryPromptParams {
  repositoryId: string;
  promptId: string;
}

class GetRepositoryPromptTool extends BaseToolHandler implements BaseToolDefinition<GetRepositoryPromptParams> {
  name = "getRepositoryPrompt";
  description = "Get a specific prompt for a repository";
  
  paramsSchema = z.object({
    repositoryId: z.string().describe("The ID of the repository"),
    promptId: z.string().describe("The ID of the prompt"),
  });

  async execute(params: GetRepositoryPromptParams): Promise<FormattedResponse> {
    const { startTime } = this.logStart(this.name, params as unknown as Record<string, unknown>);

    try {
      const apiService = this.getApiService();
      const result = await apiService.get(`/api/repositories/${params.repositoryId}/prompts/${params.promptId}`);
      
      this.logSuccess(this.name, params as unknown as Record<string, unknown>, startTime, {
        success: true,
        message: `Retrieved prompt ${params.promptId} for repository: ${params.repositoryId}`,
      });
      
      return jsonResponse(result, `✅ Retrieved prompt ${params.promptId} for repository: ${params.repositoryId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to get repository prompt", params as unknown as Record<string, unknown>, startTime);
    }
  }
}

export const getRepositoryPromptTool = new GetRepositoryPromptTool();

