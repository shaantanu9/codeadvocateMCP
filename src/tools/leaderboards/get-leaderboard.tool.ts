/**
 * Get Leaderboard Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface GetLeaderboardParams {
  type: string;
  limit?: number;
  offset?: number;
}

class GetLeaderboardTool extends BaseToolHandler implements BaseToolDefinition<GetLeaderboardParams> {
  name = "getLeaderboard";
  description = "Get the community leaderboard rankings. Shows top users by reputation, contributions, streaks, and more.";

  paramsSchema = z.object({
    type: z.string().describe("Leaderboard type: 'all-time', 'weekly', or 'monthly'"),
    limit: z.number().optional().describe("Number of results to return (default: 20)"),
    offset: z.number().optional().describe("Offset for pagination (default: 0)"),
  });

  async execute(params: GetLeaderboardParams): Promise<FormattedResponse> {
    this.logStart(this.name, { ...params });

    try {
      const apiService = this.getApiService();
      const queryParams: Record<string, string | number | boolean> = {};
      if (params.limit) queryParams.limit = params.limit;
      if (params.offset) queryParams.offset = params.offset;
      const result = await apiService.get(`/api/leaderboards/${params.type}`, queryParams);
      return jsonResponse(result, `✅ ${params.type} leaderboard retrieved`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to get leaderboard");
    }
  }
}

export const getLeaderboardTool = new GetLeaderboardTool();
