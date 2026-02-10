/**
 * Get Personalized Feed Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface GetFeedParams {
  page?: number;
  limit?: number;
}

class GetFeedTool extends BaseToolHandler implements BaseToolDefinition<GetFeedParams> {
  name = "getFeed";
  description = "Get your personalized content feed. Shows activity from users you follow, trending snippets, and recommended content.";

  paramsSchema = z.object({
    page: z.number().optional().describe("Page number (default: 1)"),
    limit: z.number().optional().describe("Results per page (default: 20)"),
  });

  async execute(params: GetFeedParams): Promise<FormattedResponse> {
    this.logStart(this.name, { ...params });

    try {
      const apiService = this.getApiService();
      const queryParams: Record<string, string | number | boolean> = {};
      if (params.page) queryParams.page = params.page;
      if (params.limit) queryParams.limit = params.limit;
      const result = await apiService.get("/api/feed", queryParams);
      return jsonResponse(result, "✅ Feed retrieved");
    } catch (error) {
      return this.handleError(this.name, error, "Failed to get feed");
    }
  }
}

export const getFeedTool = new GetFeedTool();
