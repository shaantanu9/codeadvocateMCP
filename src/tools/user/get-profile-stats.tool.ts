/**
 * Get Profile Stats Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface GetProfileStatsParams {}

class GetProfileStatsTool extends BaseToolHandler implements BaseToolDefinition<GetProfileStatsParams> {
  name = "getProfileStats";
  description = "Get the current user's statistics — total snippets, reputation, contributions, streaks, and activity metrics.";

  paramsSchema = z.object({});

  async execute(_params: GetProfileStatsParams): Promise<FormattedResponse> {
    this.logStart(this.name, {});

    try {
      const apiService = this.getApiService();
      const result = await apiService.get("/api/users/profile/stats");
      return jsonResponse(result, "✅ Profile stats retrieved");
    } catch (error) {
      return this.handleError(this.name, error, "Failed to get profile stats");
    }
  }
}

export const getProfileStatsTool = new GetProfileStatsTool();
