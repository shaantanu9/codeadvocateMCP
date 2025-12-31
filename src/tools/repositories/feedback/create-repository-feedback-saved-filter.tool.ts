/**
 * Create Repository Feedback Saved Filter Tool
 * 
 * Create a new saved filter for the current user.
 */

import { z } from "zod";
import { BaseToolHandler } from "../../base/tool-handler.base.js";
import { jsonResponse } from "../../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../../base/base-tool.interface.js";
import type { FormattedResponse } from "../../../utils/response-formatter.js";

export interface CreateRepositoryFeedbackSavedFilterParams {
  repositoryId: string;
  name: string;
  filterData: {
    status?: "open" | "in_progress" | "under_review" | "resolved" | "closed" | "rejected";
    category?: "bug_report" | "feature_request" | "improvement" | "documentation" | "performance" | "security" | "ux_ui" | "other" | "custom";
    priority?: "low" | "medium" | "high" | "critical";
    assignee?: string;
    creator?: string;
    tags?: string[];
    labels?: string[];
    dateRange?: {
      from: string;
      to: string;
    };
  };
}

class CreateRepositoryFeedbackSavedFilterTool
  extends BaseToolHandler
  implements BaseToolDefinition<CreateRepositoryFeedbackSavedFilterParams>
{
  name = "createRepositoryFeedbackSavedFilter";
  description = "Create a new saved filter for the current user";

  paramsSchema = z.object({
    repositoryId: z.string().describe("The ID of the repository"),
    name: z.string().describe("Filter name (must be unique per user per repository)"),
    filterData: z
      .object({
        status: z
          .enum(["open", "in_progress", "under_review", "resolved", "closed", "rejected"])
          .optional(),
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
          .optional(),
        priority: z.enum(["low", "medium", "high", "critical"]).optional(),
        assignee: z.string().optional(),
        creator: z.string().optional(),
        tags: z.array(z.string()).optional(),
        labels: z.array(z.string()).optional(),
        dateRange: z
          .object({
            from: z.string().describe("Start date (ISO 8601)"),
            to: z.string().describe("End date (ISO 8601)"),
          })
          .optional(),
      })
      .describe("Filter configuration object"),
  });

  async execute(
    params: CreateRepositoryFeedbackSavedFilterParams
  ): Promise<FormattedResponse> {
    const { startTime } = this.logStart(this.name, params as unknown as Record<string, unknown>);

    try {
      const apiService = this.getApiService();
      
      // Transform filterData to match API format (dateRange -> date_range with from/to)
      const filterData: Record<string, unknown> = { ...params.filterData };
      if (filterData.dateRange) {
        const dateRange = filterData.dateRange as { from: string; to: string };
        filterData.date_range = {
          from: dateRange.from,
          to: dateRange.to,
        };
        delete filterData.dateRange;
      }
      
      const body: Record<string, unknown> = {
        name: params.name,
        filter_data: filterData,
      };

      const result = await apiService.post(
        `/api/repositories/${params.repositoryId}/feedback/saved-filters`,
        body
      );

      this.logSuccess(this.name, params as unknown as Record<string, unknown>, startTime, {
        success: true,
        message: `Created saved filter: ${params.name}`,
      });

      return jsonResponse(
        result,
        `✅ Created saved filter: ${params.name}`
      );
    } catch (error) {
      return this.handleError(
        this.name,
        error,
        "Failed to create repository feedback saved filter",
        params as unknown as Record<string, unknown>,
        startTime
      );
    }
  }
}

export const createRepositoryFeedbackSavedFilterTool = new CreateRepositoryFeedbackSavedFilterTool();

