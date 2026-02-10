/**
 * Get Recommendations Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface GetRecommendationsParams {
  limit?: number;
}

class GetRecommendationsTool extends BaseToolHandler implements BaseToolDefinition<GetRecommendationsParams> {
  name = "getRecommendations";
  description = "Get personalized content recommendations based on your activity, interests, and usage patterns.";

  paramsSchema = z.object({
    limit: z.number().optional().describe("Number of recommendations to return (default: 10)"),
  });

  async execute(params: GetRecommendationsParams): Promise<FormattedResponse> {
    this.logStart(this.name, { ...params });

    try {
      const apiService = this.getApiService();
      const queryParams: Record<string, string | number | boolean> = {};
      if (params.limit) queryParams.limit = params.limit;
      const result = await apiService.get("/api/recommendations", queryParams);
      return jsonResponse(result, "✅ Recommendations retrieved");
    } catch (error) {
      return this.handleError(this.name, error, "Failed to get recommendations");
    }
  }
}

export const getRecommendationsTool = new GetRecommendationsTool();
