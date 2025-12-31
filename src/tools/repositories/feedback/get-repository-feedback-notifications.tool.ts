/**
 * Get Repository Feedback Notifications Tool
 * 
 * Get notifications for the current user related to repository feedback.
 */

import { z } from "zod";
import { BaseToolHandler } from "../../base/tool-handler.base.js";
import { jsonResponse } from "../../../utils/response-formatter.js";
import { buildQueryParams, buildPaginationParams } from "../../../utils/query-params.js";
import type { BaseToolDefinition } from "../../base/base-tool.interface.js";
import type { FormattedResponse } from "../../../utils/response-formatter.js";

export interface GetRepositoryFeedbackNotificationsParams {
  repositoryId: string;
  page?: number;
  limit?: number;
  isRead?: boolean;
}

class GetRepositoryFeedbackNotificationsTool
  extends BaseToolHandler
  implements BaseToolDefinition<GetRepositoryFeedbackNotificationsParams>
{
  name = "getRepositoryFeedbackNotifications";
  description = "Get notifications for the current user related to repository feedback";

  paramsSchema = z.object({
    repositoryId: z.string().describe("The ID of the repository"),
    page: z.number().int().min(1).optional().default(1).describe("Page number (1-based)"),
    limit: z.number().int().min(1).max(100).optional().default(20).describe("Items per page (max: 100)"),
    isRead: z.boolean().optional().describe("Filter by read status"),
  });

  async execute(
    params: GetRepositoryFeedbackNotificationsParams
  ): Promise<FormattedResponse> {
    const { startTime } = this.logStart(this.name, params as unknown as Record<string, unknown>);

    try {
      const apiService = this.getApiService();
      
      // Build pagination params with validation
      const pagination = buildPaginationParams(params.page, params.limit, 1, 20, 100);
      
      // Build query params
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

      const result = await apiService.get(
        `/api/repositories/${params.repositoryId}/feedback/notifications`,
        queryParams
      );

      this.logSuccess(this.name, params as unknown as Record<string, unknown>, startTime, {
        success: true,
        message: `Retrieved feedback notifications for repository: ${params.repositoryId}`,
      });

      return jsonResponse(
        result,
        `✅ Retrieved feedback notifications for repository: ${params.repositoryId}`
      );
    } catch (error) {
      return this.handleError(
        this.name,
        error,
        "Failed to get repository feedback notifications",
        params as unknown as Record<string, unknown>,
        startTime
      );
    }
  }
}

export const getRepositoryFeedbackNotificationsTool = new GetRepositoryFeedbackNotificationsTool();

