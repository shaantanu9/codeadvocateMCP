/**
 * Update Repository Prompt Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../../base/tool-handler.base.js";
import { jsonResponse } from "../../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../../base/base-tool.interface.js";
import type { FormattedResponse } from "../../../utils/response-formatter.js";

export interface UpdateRepositoryPromptParams {
  repositoryId: string;
  promptId: string;
  title?: string;
  promptContent?: string;
  promptType?: string;
  category?: string;
}

class UpdateRepositoryPromptTool extends BaseToolHandler implements BaseToolDefinition<UpdateRepositoryPromptParams> {
  name = "updateRepositoryPrompt";
  description = "Update a prompt for a repository";
  
  paramsSchema = z.object({
    repositoryId: z.string().describe("The ID of the repository"),
    promptId: z.string().describe("The ID of the prompt"),
    title: z.string().optional().describe("Title of the prompt"),
    promptContent: z.string().optional().describe("Content of the prompt"),
    promptType: z.string().optional().describe("Type of prompt"),
    category: z.string().optional().describe("Category"),
  });

  async execute(params: UpdateRepositoryPromptParams): Promise<FormattedResponse> {
    const { startTime } = this.logStart(this.name, params as unknown as Record<string, unknown>);

    try {
      const apiService = this.getApiService();
      const body: Record<string, unknown> = {};
      if (params.title) body.title = params.title;
      if (params.promptContent) body.prompt_content = params.promptContent;
      if (params.promptType) body.prompt_type = params.promptType;
      if (params.category) body.category = params.category;

      const result = await apiService.put(`/api/repositories/${params.repositoryId}/prompts/${params.promptId}`, body);
      
      this.logSuccess(this.name, params as unknown as Record<string, unknown>, startTime, {
        success: true,
        message: `Updated prompt ${params.promptId} for repository: ${params.repositoryId}`,
      });
      
      return jsonResponse(result, `✅ Updated prompt ${params.promptId} for repository: ${params.repositoryId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to update repository prompt", params as unknown as Record<string, unknown>, startTime);
    }
  }
}

export const updateRepositoryPromptTool = new UpdateRepositoryPromptTool();

