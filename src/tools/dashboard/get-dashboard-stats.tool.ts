/**
 * Get Dashboard Stats Tool
 *
 * Returns an overview of the user's data — snippet counts, activity metrics, etc.
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface GetDashboardStatsParams {}

class GetDashboardStatsTool extends BaseToolHandler implements BaseToolDefinition<GetDashboardStatsParams> {
  name = "getDashboardStats";
  description = "Get an overview of the user's workspace — total snippets, projects, repositories, recent activity, and other key metrics. Use this to understand the current state of the user's account.";

  paramsSchema = z.object({});

  async execute(_params: GetDashboardStatsParams): Promise<FormattedResponse> {
    this.logStart(this.name, {});

    try {
      const apiService = this.getApiService();
      const result = await apiService.get("/api/dashboard/stats");
      return jsonResponse(result, "✅ Dashboard stats retrieved");
    } catch (error) {
      return this.handleError(this.name, error, "Failed to get dashboard stats");
    }
  }
}

export const getDashboardStatsTool = new GetDashboardStatsTool();
