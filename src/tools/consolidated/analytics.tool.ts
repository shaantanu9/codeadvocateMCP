/**
 * Consolidated Analytics Tool
 *
 * Combines activity and analytics operations into a single tool with an action parameter.
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

const ACTIONS = ["getActivity", "getAnalytics", "getPopularItems"] as const;

type AnalyticsAction = (typeof ACTIONS)[number];

interface AnalyticsParams {
  action: AnalyticsAction;
  page?: number;
  limit?: number;
}

class AnalyticsTool extends BaseToolHandler implements BaseToolDefinition<AnalyticsParams> {
  name = "analytics";

  description = `View activity and analytics data. Use 'action' to specify operation:
- getActivity: Get recent activity feed (optional: page, limit)
- getAnalytics: Get overall analytics summary (no params)
- getPopularItems: Get popular/trending items (no params)`;

  paramsSchema = z.object({
    action: z.enum(ACTIONS).describe("Operation to perform"),
    page: z.number().optional().describe("Page number (default: 1). Used by: getActivity"),
    limit: z.number().optional().describe("Items per page (default: 20). Used by: getActivity"),
  });

  annotations = {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  };

  async execute(params: AnalyticsParams): Promise<FormattedResponse> {
    const api = this.getApiService();

    switch (params.action) {
      case "getActivity": {
        const { startTime } = this.logStart(`${this.name}.getActivity`, params as unknown as Record<string, unknown>);
        try {
          const queryParams: Record<string, string | number | boolean> = {};
          if (params.page) queryParams.page = params.page;
          if (params.limit) queryParams.limit = params.limit;

          const result = await api.get("/api/activity", queryParams);
          this.logSuccess(`${this.name}.getActivity`, params as unknown as Record<string, unknown>, startTime);
          return jsonResponse(result, `✅ Retrieved activity (Page ${params.page || 1}, Limit ${params.limit || 20})`);
        } catch (error) {
          return this.handleError(`${this.name}.getActivity`, error, "Failed to get activity", params as unknown as Record<string, unknown>, startTime);
        }
      }
      case "getAnalytics": {
        const { startTime } = this.logStart(`${this.name}.getAnalytics`, {});
        try {
          const result = await api.get("/api/analytics");
          this.logSuccess(`${this.name}.getAnalytics`, {}, startTime);
          return jsonResponse(result, "✅ Retrieved analytics summary");
        } catch (error) {
          return this.handleError(`${this.name}.getAnalytics`, error, "Failed to get analytics", {}, startTime);
        }
      }
      case "getPopularItems": {
        const { startTime } = this.logStart(`${this.name}.getPopularItems`, {});
        try {
          const result = await api.get("/api/analytics/popular");
          this.logSuccess(`${this.name}.getPopularItems`, {}, startTime);
          return jsonResponse(result, "✅ Retrieved popular items");
        } catch (error) {
          return this.handleError(`${this.name}.getPopularItems`, error, "Failed to get popular items", {}, startTime);
        }
      }
      default:
        return this.handleError(this.name, new Error(`Unknown action: ${params.action}`), `Unknown action`);
    }
  }
}

export const analyticsTool = new AnalyticsTool();
