/**
 * Create Repository Feedback Tool
 * 
 * Create a new feedback item in a repository.
 */

import { z } from "zod";
import { BaseToolHandler } from "../../base/tool-handler.base.js";
import { jsonResponse } from "../../../utils/response-formatter.js";
import { processTags } from "../../../utils/tag-filter.js";
import type { BaseToolDefinition } from "../../base/base-tool.interface.js";
import type { FormattedResponse } from "../../../utils/response-formatter.js";

export interface CreateRepositoryFeedbackParams {
  repositoryId: string;
  title: string;
  description: string;
  category?: "bug_report" | "feature_request" | "improvement" | "documentation" | "performance" | "security" | "ux_ui" | "other" | "custom";
  customCategory?: string;
  priority?: "low" | "medium" | "high" | "critical";
  tags?: string[];
  labels?: string[];
}

class CreateRepositoryFeedbackTool
  extends BaseToolHandler
  implements BaseToolDefinition<CreateRepositoryFeedbackParams>
{
  name = "createRepositoryFeedback";
  description = "Create a new feedback item in a repository";

  paramsSchema = z.object({
    repositoryId: z.string().describe("The ID of the repository"),
    title: z.string().max(255).describe("Feedback title (max length: 255)"),
    description: z.string().describe("Feedback description"),
    category: z
      .enum([
        "bug_report",
        "feature_request",
        "improvement",
        "documentation",
        "performance",
        "security",
        "ux_ui",
        "other",
        "custom",
      ])
      .optional()
      .default("other")
      .describe("Category"),
    customCategory: z
      .string()
      .optional()
      .describe("Required if category is 'custom'"),
    priority: z
      .enum(["low", "medium", "high", "critical"])
      .optional()
      .default("medium")
      .describe("Priority"),
    tags: z.array(z.string()).optional().default([]).describe("Tags for categorization"),
    labels: z.array(z.string()).optional().default([]).describe("Labels for organization"),
  });

  async execute(
    params: CreateRepositoryFeedbackParams
  ): Promise<FormattedResponse> {
    const { startTime } = this.logStart(this.name, params as unknown as Record<string, unknown>);

    try {
      // Validate custom category requirement
      if (params.category === "custom" && !params.customCategory) {
        throw new Error("custom_category is required when category is 'custom'");
      }

      const apiService = this.getApiService();
      // Filter and process tags to remove IDs
      const filteredTags = processTags(params.tags, params.repositoryId);
      
      const body: Record<string, unknown> = {
        title: params.title,
        description: params.description,
        category: params.category || "other",
        priority: params.priority || "medium",
        tags: filteredTags,
        labels: params.labels || [],
      };

      if (params.customCategory) {
        body.custom_category = params.customCategory;
      }

      const result = await apiService.post(
        `/api/repositories/${params.repositoryId}/feedback`,
        body
      );

      this.logSuccess(this.name, params as unknown as Record<string, unknown>, startTime, {
        success: true,
        message: `Created feedback for repository: ${params.repositoryId}`,
      });

      return jsonResponse(
        result,
        `✅ Created feedback: ${params.title}`
      );
    } catch (error) {
      return this.handleError(
        this.name,
        error,
        "Failed to create repository feedback",
        params as unknown as Record<string, unknown>,
        startTime
      );
    }
  }
}

export const createRepositoryFeedbackTool = new CreateRepositoryFeedbackTool();


