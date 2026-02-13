/**
 * Consolidated Feed Tool
 *
 * Combines feed and recommendation operations into a single tool with an action parameter.
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

const ACTIONS = ["getFeed", "getRecommendations"] as const;

type FeedAction = (typeof ACTIONS)[number];

interface FeedParams {
  action: FeedAction;
  page?: number;
  limit?: number;
}

class FeedTool extends BaseToolHandler implements BaseToolDefinition<FeedParams> {
  name = "feed";

  description = `View feed and recommendations. Use 'action' to specify operation:
- getFeed: Get the activity/content feed (optional: page, limit)
- getRecommendations: Get personalized recommendations (optional: limit)`;

  paramsSchema = z.object({
    action: z.enum(ACTIONS).describe("Operation to perform"),
    page: z.number().optional().describe("Page number (default: 1). Used by: getFeed"),
    limit: z.number().optional().describe("Items per page (default: 20). Used by: getFeed, getRecommendations"),
  });

  annotations = {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  };

  async execute(params: FeedParams): Promise<FormattedResponse> {
    const api = this.getApiService();

    switch (params.action) {
      case "getFeed": {
        const { startTime } = this.logStart(`${this.name}.getFeed`, params as unknown as Record<string, unknown>);
        try {
          const queryParams: Record<string, string | number | boolean> = {};
          if (params.page) queryParams.page = params.page;
          if (params.limit) queryParams.limit = params.limit;

          const result = await api.get("/api/feed", queryParams);
          this.logSuccess(`${this.name}.getFeed`, params as unknown as Record<string, unknown>, startTime);
          return jsonResponse(result, `✅ Retrieved feed (Page ${params.page || 1}, Limit ${params.limit || 20})`);
        } catch (error) {
          return this.handleError(`${this.name}.getFeed`, error, "Failed to get feed", params as unknown as Record<string, unknown>, startTime);
        }
      }
      case "getRecommendations": {
        const { startTime } = this.logStart(`${this.name}.getRecommendations`, params as unknown as Record<string, unknown>);
        try {
          const queryParams: Record<string, string | number | boolean> = {};
          if (params.limit) queryParams.limit = params.limit;

          const result = await api.get("/api/recommendations", queryParams);
          this.logSuccess(`${this.name}.getRecommendations`, params as unknown as Record<string, unknown>, startTime);
          return jsonResponse(result, "✅ Retrieved recommendations");
        } catch (error) {
          return this.handleError(`${this.name}.getRecommendations`, error, "Failed to get recommendations", params as unknown as Record<string, unknown>, startTime);
        }
      }
      default:
        return this.handleError(this.name, new Error(`Unknown action: ${params.action}`), `Unknown action`);
    }
  }
}

export const feedTool = new FeedTool();
