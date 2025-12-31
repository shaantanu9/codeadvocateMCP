/**
 * Create Repository Learning Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../../base/tool-handler.base.js";
import { jsonResponse } from "../../../utils/response-formatter.js";
import { logger } from "../../../core/logger.js";
import { processTags } from "../../../utils/tag-filter.js";
import type { BaseToolDefinition } from "../../base/base-tool.interface.js";
import type { FormattedResponse } from "../../../utils/response-formatter.js";

export interface CreateRepositoryLearningParams {
  repositoryId: string;
  title: string;
  content: string;
  category?: "general" | "architecture" | "patterns" | "performance" | "security" | "testing" | "deployment" | "troubleshooting";
  keyTakeaways?: string[];
  relatedFiles?: string[];
  tags?: string[];
  importance?: "low" | "medium" | "high" | "critical";
}

class CreateRepositoryLearningTool extends BaseToolHandler implements BaseToolDefinition<CreateRepositoryLearningParams> {
  name = "createRepositoryLearning";
  description = "Create a new learning for a repository";
  
  paramsSchema = z.object({
    repositoryId: z.string().describe("The ID of the repository"),
    title: z.string().describe("Title of the learning"),
    content: z.string().describe("Markdown content describing the learning"),
    category: z.enum(["general", "architecture", "patterns", "performance", "security", "testing", "deployment", "troubleshooting"]).optional().default("general").describe("Learning category"),
    keyTakeaways: z.array(z.string()).optional().default([]).describe("Array of key points"),
    relatedFiles: z.array(z.string()).optional().default([]).describe("Array of file paths"),
    tags: z.array(z.string()).optional().default([]).describe("Array of tags"),
    importance: z.enum(["low", "medium", "high", "critical"]).optional().default("medium").describe("Importance level"),
  });

  async execute(params: CreateRepositoryLearningParams): Promise<FormattedResponse> {
    const { startTime } = this.logStart(this.name, { ...params } as Record<string, unknown>);

    try {
      const apiService = this.getApiService();
      const body: Record<string, unknown> = {
        title: params.title,
        content: params.content,
      };

      if (params.category !== undefined) body.category = params.category;
      if (params.keyTakeaways !== undefined && params.keyTakeaways.length > 0) body.key_takeaways = params.keyTakeaways;
      if (params.relatedFiles !== undefined && params.relatedFiles.length > 0) body.related_files = params.relatedFiles;
      
      // Filter and process tags to remove IDs
      const filteredTags = processTags(params.tags, params.repositoryId);
      if (filteredTags.length > 0) body.tags = filteredTags;
      
      if (params.importance !== undefined) body.importance = params.importance;

      logger.debug(`[${this.name}] Preparing API request`, {
        endpoint: `/api/repositories/${params.repositoryId}/learnings`,
        method: "POST",
        body: {
          title: body.title,
          content_length: typeof body.content === "string" ? body.content.length : 0,
          category: body.category || "general",
          importance: body.importance || "medium",
          key_takeaways_count: Array.isArray(body.key_takeaways) ? body.key_takeaways.length : 0,
          related_files_count: Array.isArray(body.related_files) ? body.related_files.length : 0,
          tags_count: Array.isArray(body.tags) ? body.tags.length : 0,
        },
        repositoryId: params.repositoryId,
      });

      const result = await apiService.post(`/api/repositories/${params.repositoryId}/learnings`, body);
      
      this.logSuccess(this.name, { ...params } as Record<string, unknown>, startTime, {
        success: true,
        message: `Created learning for repository: ${params.repositoryId}`,
      });
      
      return jsonResponse(result, `✅ Created learning for repository: ${params.repositoryId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to create repository learning", { ...params } as Record<string, unknown>, startTime);
    }
  }
}

export const createRepositoryLearningTool = new CreateRepositoryLearningTool();

