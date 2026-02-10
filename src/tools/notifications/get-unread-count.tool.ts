/**
 * Get Unread Notification Count Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface GetUnreadCountParams {}

class GetUnreadCountTool extends BaseToolHandler implements BaseToolDefinition<GetUnreadCountParams> {
  name = "getUnreadNotificationCount";
  description = "Get the count of unread notifications. Quick way to check if there are pending notifications without fetching them all.";

  paramsSchema = z.object({});

  async execute(_params: GetUnreadCountParams): Promise<FormattedResponse> {
    this.logStart(this.name, {});

    try {
      const apiService = this.getApiService();
      const result = await apiService.get("/api/notifications/unread-count");
      return jsonResponse(result, "✅ Unread notification count retrieved");
    } catch (error) {
      return this.handleError(this.name, error, "Failed to get unread count");
    }
  }
}

export const getUnreadCountTool = new GetUnreadCountTool();
