/**
 * Consolidated Repository Feedback Tool
 *
 * Combines all repository feedback operations into a single tool with an action parameter.
 * Actions: list, get, create, getStats, getNotifications, listSavedFilters, createSavedFilter
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import { buildQueryParams, buildPaginationParams } from "../../utils/query-params.js";
import { processTags } from "../../utils/tag-filter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

const ACTIONS = ["list", "get", "create", "getStats", "getNotifications", "listSavedFilters", "createSavedFilter"] as const;

interface Params {
  action: (typeof ACTIONS)[number];
  repositoryId?: string;
  feedbackId?: string;
  title?: string;
  feedbackDescription?: string;
  category?: string;
  customCategory?: string;
  priority?: string;
  tags?: string[] | string;
  labels?: string[] | string;
  search?: string;
  status?: string;
  assignee?: string;
  creator?: string;
  dateFrom?: string;
  dateTo?: string;
  view?: string;
  sort?: string;
  order?: string;
  page?: number;
  limit?: number;
  isRead?: boolean;
  name?: string;
  filterData?: Record<string, unknown>;
}

class RepositoryFeedbackTool extends BaseToolHandler implements BaseToolDefinition<Params> {
  name = "repositoryFeedback";

  description = `Manage repository feedback. Use 'action' to specify operation:
- list: List feedback (requires: repositoryId; optional: search, status, category, priority, assignee, creator, tags, labels, dateFrom, dateTo, view, sort, order, page, limit)
- get: Get feedback by ID (requires: repositoryId, feedbackId)
- create: Create feedback (requires: repositoryId, title, feedbackDescription; optional: category, customCategory, priority, tags, labels)
- getStats: Get feedback statistics (requires: repositoryId)
- getNotifications: Get feedback notifications (requires: repositoryId; optional: page, limit, isRead)
- listSavedFilters: List saved filters (requires: repositoryId)
- createSavedFilter: Create saved filter (requires: repositoryId, name, filterData)`;

  paramsSchema = z.object({
    action: z.enum(ACTIONS).describe("Operation to perform"),
    repositoryId: z.string().optional().describe("Repository ID. Required for all actions."),
    feedbackId: z.string().optional().describe("Feedback ID. Required for: get"),
    title: z.string().max(255).optional().describe("Feedback title (max 255 chars). Required for: create"),
    feedbackDescription: z.string().optional().describe("Feedback description. Required for: create"),
    category: z.enum(["bug_report", "feature_request", "improvement", "documentation", "performance", "security", "ux_ui", "other", "custom"]).optional().describe("Category (default: other)"),
    customCategory: z.string().optional().describe("Custom category. Required if category is 'custom'"),
    priority: z.enum(["low", "medium", "high", "critical"]).optional().describe("Priority (default: medium)"),
    tags: z.union([z.array(z.string()), z.string()]).optional().describe("Tags for categorization (array for create, comma-separated string for list filter)"),
    labels: z.union([z.array(z.string()), z.string()]).optional().describe("Labels for organization (array for create, comma-separated string for list filter)"),
    search: z.string().optional().describe("Search in title and description"),
    status: z.enum(["open", "in_progress", "under_review", "resolved", "closed", "rejected"]).optional().describe("Filter by status"),
    assignee: z.string().optional().describe("Filter by assignee user ID"),
    creator: z.string().optional().describe("Filter by creator user ID"),
    dateFrom: z.string().optional().describe("Filter by creation date from (ISO 8601)"),
    dateTo: z.string().optional().describe("Filter by creation date to (ISO 8601)"),
    view: z.enum(["all", "my_feedback", "assigned_to_me", "trending"]).optional().describe("View filter (default: all)"),
    sort: z.enum(["created_at", "updated_at", "upvotes_count", "priority"]).optional().describe("Sort field (default: created_at)"),
    order: z.enum(["asc", "desc"]).optional().describe("Sort order (default: desc)"),
    page: z.number().int().min(1).optional().default(1).describe("Page number for pagination"),
    limit: z.number().int().min(1).max(100).optional().default(20).describe("Items per page (max: 100)"),
    isRead: z.boolean().optional().describe("Filter notifications by read status"),
    name: z.string().optional().describe("Saved filter name. Required for: createSavedFilter"),
    filterData: z.record(z.unknown()).optional().describe("Saved filter configuration. Required for: createSavedFilter"),
  });

  annotations = { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true };

  async execute(params: Params): Promise<FormattedResponse> {
    const api = this.getApiService();
    switch (params.action) {
      case "list": {
        const repositoryId = this.requireParam(params.repositoryId, "repositoryId", "list");
        const { startTime } = this.logStart(`${this.name}.list`, { repositoryId });
        try {
          const pagination = buildPaginationParams(params.page, params.limit, 1, 20, 100);
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
          const result = await api.get(`/api/repositories/${repositoryId}/feedback`, queryParams);
          this.logSuccess(`${this.name}.list`, { repositoryId }, startTime);
          return jsonResponse(result, `✅ Retrieved feedback for repository: ${repositoryId}`);
        } catch (error) {
          return this.handleError(`${this.name}.list`, error, "Failed to list feedback", { repositoryId }, startTime);
        }
      }
      case "get": {
        const repositoryId = this.requireParam(params.repositoryId, "repositoryId", "get");
        const feedbackId = this.requireParam(params.feedbackId, "feedbackId", "get");
        const { startTime } = this.logStart(`${this.name}.get`, { repositoryId, feedbackId });
        try {
          const result = await api.get(`/api/repositories/${repositoryId}/feedback/${feedbackId}`);
          this.logSuccess(`${this.name}.get`, { repositoryId, feedbackId }, startTime);
          return jsonResponse(result, `✅ Retrieved feedback: ${feedbackId}`);
        } catch (error) {
          return this.handleError(`${this.name}.get`, error, "Failed to get feedback", { repositoryId, feedbackId }, startTime);
        }
      }
      case "create": {
        const repositoryId = this.requireParam(params.repositoryId, "repositoryId", "create");
        const title = this.requireParam(params.title, "title", "create");
        const feedbackDescription = this.requireParam(params.feedbackDescription, "feedbackDescription", "create");
        const { startTime } = this.logStart(`${this.name}.create`, { repositoryId, title });
        try {
          // Validate custom category requirement
          if (params.category === "custom" && !params.customCategory) {
            throw new Error("customCategory is required when category is 'custom'");
          }

          // Process tags - ensure it's an array for create
          const tagsArray = Array.isArray(params.tags) ? params.tags : [];
          const filteredTags = processTags(tagsArray, repositoryId);
          const labelsArray = Array.isArray(params.labels) ? params.labels : [];

          const body: Record<string, unknown> = {
            title,
            description: feedbackDescription,
            category: params.category || "other",
            priority: params.priority || "medium",
            tags: filteredTags,
            labels: labelsArray,
          };

          if (params.customCategory !== undefined) {
            body.custom_category = params.customCategory;
          }

          const result = await api.post(`/api/repositories/${repositoryId}/feedback`, body);
          this.logSuccess(`${this.name}.create`, { repositoryId, title }, startTime);
          return jsonResponse(result, `✅ Created feedback: ${title}`);
        } catch (error) {
          return this.handleError(`${this.name}.create`, error, "Failed to create feedback", { repositoryId, title }, startTime);
        }
      }
      case "getStats": {
        const repositoryId = this.requireParam(params.repositoryId, "repositoryId", "getStats");
        const { startTime } = this.logStart(`${this.name}.getStats`, { repositoryId });
        try {
          const result = await api.get(`/api/repositories/${repositoryId}/feedback/stats`);
          this.logSuccess(`${this.name}.getStats`, { repositoryId }, startTime);
          return jsonResponse(result, `✅ Retrieved feedback statistics for repository: ${repositoryId}`);
        } catch (error) {
          return this.handleError(`${this.name}.getStats`, error, "Failed to get feedback stats", { repositoryId }, startTime);
        }
      }
      case "getNotifications": {
        const repositoryId = this.requireParam(params.repositoryId, "repositoryId", "getNotifications");
        const { startTime } = this.logStart(`${this.name}.getNotifications`, { repositoryId });
        try {
          const pagination = buildPaginationParams(params.page, params.limit, 1, 20, 100);
          const queryParams = buildQueryParams(
            {
              page: pagination.page,
              limit: pagination.limit,
              isRead: params.isRead,
            },
            {
              isRead: "is_read",
            }
          );
          const result = await api.get(`/api/repositories/${repositoryId}/feedback/notifications`, queryParams);
          this.logSuccess(`${this.name}.getNotifications`, { repositoryId }, startTime);
          return jsonResponse(result, `✅ Retrieved feedback notifications for repository: ${repositoryId}`);
        } catch (error) {
          return this.handleError(`${this.name}.getNotifications`, error, "Failed to get feedback notifications", { repositoryId }, startTime);
        }
      }
      case "listSavedFilters": {
        const repositoryId = this.requireParam(params.repositoryId, "repositoryId", "listSavedFilters");
        const { startTime } = this.logStart(`${this.name}.listSavedFilters`, { repositoryId });
        try {
          const result = await api.get(`/api/repositories/${repositoryId}/feedback/saved-filters`);
          this.logSuccess(`${this.name}.listSavedFilters`, { repositoryId }, startTime);
          return jsonResponse(result, `✅ Retrieved saved filters for repository: ${repositoryId}`);
        } catch (error) {
          return this.handleError(`${this.name}.listSavedFilters`, error, "Failed to list saved filters", { repositoryId }, startTime);
        }
      }
      case "createSavedFilter": {
        const repositoryId = this.requireParam(params.repositoryId, "repositoryId", "createSavedFilter");
        const filterName = this.requireParam(params.name, "name", "createSavedFilter");
        const filterData = this.requireParam(params.filterData, "filterData", "createSavedFilter");
        const { startTime } = this.logStart(`${this.name}.createSavedFilter`, { repositoryId, name: filterName });
        try {
          const body: Record<string, unknown> = {
            name: filterName,
            filter_data: filterData,
          };

          const result = await api.post(`/api/repositories/${repositoryId}/feedback/saved-filters`, body);
          this.logSuccess(`${this.name}.createSavedFilter`, { repositoryId, name: filterName }, startTime);
          return jsonResponse(result, `✅ Created saved filter: ${filterName}`);
        } catch (error) {
          return this.handleError(`${this.name}.createSavedFilter`, error, "Failed to create saved filter", { repositoryId, name: filterName }, startTime);
        }
      }
      default:
        return this.handleError(this.name, new Error(`Unknown action: ${params.action}`), `Unknown action`);
    }
  }
}

export const repositoryFeedbackTool = new RepositoryFeedbackTool();
