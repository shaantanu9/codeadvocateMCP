/**
 * List Repository Feedback Tool
 * 
 * Get a paginated list of feedback items for a repository with filtering, sorting, and search.
 */

import { z } from "zod";
import { BaseToolHandler } from "../../base/tool-handler.base.js";
import { jsonResponse } from "../../../utils/response-formatter.js";
import { buildQueryParams, buildPaginationParams } from "../../../utils/query-params.js";
import type { BaseToolDefinition } from "../../base/base-tool.interface.js";
import type { FormattedResponse } from "../../../utils/response-formatter.js";

export interface ListRepositoryFeedbackParams {
  repositoryId: string;
  page?: number;
  limit?: number;
  search?: string;
  status?: "open" | "in_progress" | "under_review" | "resolved" | "closed" | "rejected";
  category?: "bug_report" | "feature_request" | "improvement" | "documentation" | "performance" | "security" | "ux_ui" | "other" | "custom";
  priority?: "low" | "medium" | "high" | "critical";
  assignee?: string;
  creator?: string;
  tags?: string;
  labels?: string;
  dateFrom?: string;
  dateTo?: string;
  view?: "all" | "my_feedback" | "assigned_to_me" | "trending";
  sort?: "created_at" | "updated_at" | "upvotes_count" | "priority";
  order?: "asc" | "desc";
}

class ListRepositoryFeedbackTool
  extends BaseToolHandler
  implements BaseToolDefinition<ListRepositoryFeedbackParams>
{
  name = "listRepositoryFeedback";
  description = "List feedback items for a repository with filtering, sorting, and search";

  paramsSchema = z.object({
    repositoryId: z.string().describe("The ID of the repository"),
    page: z.number().int().min(1).optional().default(1).describe("Page number (1-based)"),
    limit: z.number().int().min(1).max(100).optional().default(20).describe("Items per page (max: 100)"),
    search: z.string().optional().describe("Search in title and description"),
    status: z
      .enum(["open", "in_progress", "under_review", "resolved", "closed", "rejected"])
      .optional()
      .describe("Filter by status"),
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
      .describe("Filter by category"),
    priority: z
      .enum(["low", "medium", "high", "critical"])
      .optional()
      .describe("Filter by priority"),
    assignee: z.string().optional().describe("Filter by assignee user ID"),
    creator: z.string().optional().describe("Filter by creator user ID"),
    tags: z.string().optional().describe("Filter by tags (comma-separated)"),
    labels: z.string().optional().describe("Filter by labels (comma-separated)"),
    dateFrom: z.string().optional().describe("Filter by creation date from (ISO 8601)"),
    dateTo: z.string().optional().describe("Filter by creation date to (ISO 8601)"),
    view: z
      .enum(["all", "my_feedback", "assigned_to_me", "trending"])
      .optional()
      .default("all")
      .describe("View filter"),
    sort: z
      .enum(["created_at", "updated_at", "upvotes_count", "priority"])
      .optional()
      .default("created_at")
      .describe("Sort field"),
    order: z.enum(["asc", "desc"]).optional().default("desc").describe("Sort order"),
  });

  async execute(params: ListRepositoryFeedbackParams): Promise<FormattedResponse> {
    const { startTime } = this.logStart(this.name, params as unknown as Record<string, unknown>);

    try {
      const apiService = this.getApiService();
      
      // Build pagination params with validation
      const pagination = buildPaginationParams(params.page, params.limit, 1, 20, 100);
      
      // Build query params with camelCase to snake_case mapping
      const queryParams = buildQueryParams(
        {
          page: pagination.page,
          limit: pagination.limit,
          search: params.search,
          status: params.status,
          category: params.category,
          priority: params.priority,
          assignee: params.assignee,
          creator: params.creator,
          tags: params.tags,
          labels: params.labels,
          dateFrom: params.dateFrom,
          dateTo: params.dateTo,
          view: params.view,
          sort: params.sort,
          order: params.order,
        },
        {
          dateFrom: "date_from",
          dateTo: "date_to",
        }
      );

      const result = await apiService.get(
        `/api/repositories/${params.repositoryId}/feedback`,
        queryParams
      );

      this.logSuccess(this.name, params as unknown as Record<string, unknown>, startTime, {
        success: true,
        message: `Retrieved feedback for repository: ${params.repositoryId}`,
      });

      return jsonResponse(
        result,
        `✅ Retrieved feedback for repository: ${params.repositoryId}`
      );
    } catch (error) {
      return this.handleError(
        this.name,
        error,
        "Failed to list repository feedback",
        params as unknown as Record<string, unknown>,
        startTime
      );
    }
  }
}

export const listRepositoryFeedbackTool = new ListRepositoryFeedbackTool();

