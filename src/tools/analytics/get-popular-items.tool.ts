/**
 * Get Popular Items Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface GetPopularItemsParams {
  // No parameters
}

class GetPopularItemsTool extends BaseToolHandler implements BaseToolDefinition<GetPopularItemsParams> {
  name = "getPopularItems";
  description = "Get popular items analytics";
  
  paramsSchema = z.object({});

  async execute(_params: GetPopularItemsParams): Promise<FormattedResponse> {
    this.logStart(this.name);

    try {
      const apiService = this.getApiService();
      const result = await apiService.get("/api/analytics/popular");
      return jsonResponse(result, `✅ Retrieved popular items`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to get popular items");
    }
  }
}

export const getPopularItemsTool = new GetPopularItemsTool();




