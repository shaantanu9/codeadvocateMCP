/**
 * Mark Notification Read Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface MarkNotificationReadParams {
  notificationId: string;
}

class MarkNotificationReadTool extends BaseToolHandler implements BaseToolDefinition<MarkNotificationReadParams> {
  name = "markNotificationRead";
  description = "Mark a specific notification as read.";

  paramsSchema = z.object({
    notificationId: z.string().describe("The ID of the notification to mark as read"),
  });

  async execute(params: MarkNotificationReadParams): Promise<FormattedResponse> {
    this.logStart(this.name, { notificationId: params.notificationId });

    try {
      const apiService = this.getApiService();
      const result = await apiService.patch(`/api/notifications/${params.notificationId}/read`, {});
      return jsonResponse(result, `✅ Notification marked as read: ${params.notificationId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to mark notification as read");
    }
  }
}

export const markNotificationReadTool = new MarkNotificationReadTool();
