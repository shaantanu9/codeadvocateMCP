/**
 * Consolidated Notifications Tool
 *
 * Combines notification listing, unread count, and mark-read operations into a single tool with an action parameter.
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

const ACTIONS = ["list", "getUnreadCount", "markRead"] as const;

type NotificationsAction = (typeof ACTIONS)[number];

interface NotificationsParams {
  action: NotificationsAction;
  notificationId?: string;
  read?: boolean;
  type?: string;
  page?: number;
  limit?: number;
}

class NotificationsTool extends BaseToolHandler implements BaseToolDefinition<NotificationsParams> {
  name = "notifications";

  description = `Manage notifications. Use 'action' to specify operation:
- list: List notifications (optional: read, type, page, limit)
- getUnreadCount: Get count of unread notifications (no params)
- markRead: Mark a notification as read (requires: notificationId)`;

  paramsSchema = z.object({
    action: z.enum(ACTIONS).describe("Operation to perform"),
    notificationId: z.string().optional().describe("Notification ID. Required for: markRead"),
    read: z.boolean().optional().describe("Filter by read status. Used by: list"),
    type: z.string().optional().describe("Filter by notification type. Used by: list"),
    page: z.number().optional().describe("Page number (default: 1). Used by: list"),
    limit: z.number().optional().describe("Items per page (default: 20). Used by: list"),
  });

  annotations = {
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
  };

  async execute(params: NotificationsParams): Promise<FormattedResponse> {
    const api = this.getApiService();

    switch (params.action) {
      case "list": {
        const { startTime } = this.logStart(`${this.name}.list`, params as unknown as Record<string, unknown>);
        try {
          const queryParams: Record<string, string | number | boolean> = {};
          if (params.read !== undefined) queryParams.read = params.read;
          if (params.type) queryParams.type = params.type;
          if (params.page) queryParams.page = params.page;
          if (params.limit) queryParams.limit = params.limit;

          const result = await api.get("/api/notifications", queryParams);
          this.logSuccess(`${this.name}.list`, params as unknown as Record<string, unknown>, startTime);
          return jsonResponse(result, `✅ Retrieved notifications (Page ${params.page || 1}, Limit ${params.limit || 20})`);
        } catch (error) {
          return this.handleError(`${this.name}.list`, error, "Failed to list notifications", params as unknown as Record<string, unknown>, startTime);
        }
      }
      case "getUnreadCount": {
        const { startTime } = this.logStart(`${this.name}.getUnreadCount`, {});
        try {
          const result = await api.get("/api/notifications/unread-count");
          this.logSuccess(`${this.name}.getUnreadCount`, {}, startTime);
          return jsonResponse(result, "✅ Retrieved unread notification count");
        } catch (error) {
          return this.handleError(`${this.name}.getUnreadCount`, error, "Failed to get unread count", {}, startTime);
        }
      }
      case "markRead": {
        const notificationId = this.requireParam(params.notificationId, "notificationId", "markRead");
        const { startTime } = this.logStart(`${this.name}.markRead`, { notificationId });
        try {
          const result = await api.patch(`/api/notifications/${notificationId}/read`, {});
          this.logSuccess(`${this.name}.markRead`, { notificationId }, startTime);
          return jsonResponse(result, `✅ Marked notification as read: ${notificationId}`);
        } catch (error) {
          return this.handleError(`${this.name}.markRead`, error, "Failed to mark notification as read", { notificationId }, startTime);
        }
      }
      default:
        return this.handleError(this.name, new Error(`Unknown action: ${params.action}`), `Unknown action`);
    }
  }
}

export const notificationsTool = new NotificationsTool();
