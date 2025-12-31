/**
 * Update Repository Learning Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../../base/tool-handler.base.js";
import { jsonResponse } from "../../../utils/response-formatter.js";
import { AppError } from "../../../core/errors.js";
import type { BaseToolDefinition } from "../../base/base-tool.interface.js";
import type { FormattedResponse } from "../../../utils/response-formatter.js";

export interface UpdateRepositoryLearningParams {
  repositoryId: string;
  learningId: string;
  title?: string;
  content?: string;
  category?: "general" | "architecture" | "patterns" | "performance" | "security" | "testing" | "deployment" | "troubleshooting";
  keyTakeaways?: string[];
  relatedFiles?: string[];
  tags?: string[];
  importance?: "low" | "medium" | "high" | "critical";
}

class UpdateRepositoryLearningTool extends BaseToolHandler implements BaseToolDefinition<UpdateRepositoryLearningParams> {
  name = "updateRepositoryLearning";
  description = "Update a learning for a repository";
  
  paramsSchema = z.object({
    repositoryId: z.string().describe("The ID of the repository"),
    learningId: z.string().describe("The ID of the learning"),
    title: z.string().optional().describe("Title of the learning"),
    content: z.string().optional().describe("Markdown content"),
    category: z.enum(["general", "architecture", "patterns", "performance", "security", "testing", "deployment", "troubleshooting"]).optional().describe("Learning category"),
    keyTakeaways: z.array(z.string()).optional().describe("Array of key points"),
    relatedFiles: z.array(z.string()).optional().describe("Array of file paths"),
    tags: z.array(z.string()).optional().describe("Array of tags"),
    importance: z.enum(["low", "medium", "high", "critical"]).optional().describe("Importance level"),
  });

  async execute(params: UpdateRepositoryLearningParams): Promise<FormattedResponse> {
    const { startTime } = this.logStart(this.name, { ...params } as Record<string, unknown>);

    try {
      const apiService = this.getApiService();
      const body: Record<string, unknown> = {};

      if (params.title !== undefined) body.title = params.title;
      if (params.content !== undefined) body.content = params.content;
      if (params.category !== undefined) body.category = params.category;
      if (params.keyTakeaways !== undefined) body.key_takeaways = params.keyTakeaways;
      if (params.relatedFiles !== undefined) body.related_files = params.relatedFiles;
      if (params.tags !== undefined) body.tags = params.tags;
      if (params.importance !== undefined) body.importance = params.importance;

      // Ensure at least one field is provided
      if (Object.keys(body).length === 0) {
        throw new AppError("At least one field must be provided for update", "NO_FIELDS");
      }

      const result = await apiService.patch(`/api/repositories/${params.repositoryId}/learnings/${params.learningId}`, body);
      
      this.logSuccess(this.name, { ...params } as Record<string, unknown>, startTime, {
        success: true,
        message: `Updated learning ${params.learningId} for repository: ${params.repositoryId}`,
      });
      
      return jsonResponse(result, `✅ Updated learning ${params.learningId} for repository: ${params.repositoryId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to update repository learning", { ...params } as Record<string, unknown>, startTime);
    }
  }
}

export const updateRepositoryLearningTool = new UpdateRepositoryLearningTool();

