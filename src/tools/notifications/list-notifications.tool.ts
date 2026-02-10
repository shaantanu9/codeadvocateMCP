/**
 * List Notifications Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface ListNotificationsParams {
  read?: boolean;
  type?: string;
  page?: number;
  limit?: number;
}

class ListNotificationsTool extends BaseToolHandler implements BaseToolDefinition<ListNotificationsParams> {
  name = "listNotifications";
  description = "List notifications for the current user. Can filter by read/unread status and notification type.";

  paramsSchema = z.object({
    read: z.boolean().optional().describe("Filter by read status (true=read, false=unread)"),
    type: z.string().optional().describe("Filter by notification type"),
    page: z.number().optional().describe("Page number (default: 1)"),
    limit: z.number().optional().describe("Results per page (default: 20)"),
  });

  async execute(params: ListNotificationsParams): Promise<FormattedResponse> {
    this.logStart(this.name, { ...params });

    try {
      const apiService = this.getApiService();
      const queryParams: Record<string, string | number | boolean> = {};
      if (params.read !== undefined) queryParams.read = params.read;
      if (params.type) queryParams.type = params.type;
      if (params.page) queryParams.page = params.page;
      if (params.limit) queryParams.limit = params.limit;
      const result = await apiService.get("/api/notifications", queryParams);
      return jsonResponse(result, "✅ Notifications retrieved");
    } catch (error) {
      return this.handleError(this.name, error, "Failed to list notifications");
    }
  }
}

export const listNotificationsTool = new ListNotificationsTool();
