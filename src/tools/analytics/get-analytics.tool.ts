/**
 * Get Analytics Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface GetAnalyticsParams {
  // No parameters
}

class GetAnalyticsTool extends BaseToolHandler implements BaseToolDefinition<GetAnalyticsParams> {
  name = "getAnalytics";
  description = "Get analytics data";
  
  paramsSchema = z.object({});

  async execute(_params: GetAnalyticsParams): Promise<FormattedResponse> {
    this.logStart(this.name);

    try {
      const apiService = this.getApiService();
      const result = await apiService.get("/api/analytics");
      return jsonResponse(result, `✅ Retrieved analytics`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to get analytics");
    }
  }
}

export const getAnalyticsTool = new GetAnalyticsTool();




