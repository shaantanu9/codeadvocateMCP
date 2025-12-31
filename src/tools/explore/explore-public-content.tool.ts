/**
 * Explore Public Content Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface ExplorePublicContentParams {
  search?: string;
}

class ExplorePublicContentTool extends BaseToolHandler implements BaseToolDefinition<ExplorePublicContentParams> {
  name = "explorePublicContent";
  description = "Explore public content with search";
  
  paramsSchema = z.object({
    search: z.string().optional().describe("Search term to filter content"),
  });

  async execute(params: ExplorePublicContentParams): Promise<FormattedResponse> {
    this.logStart(this.name, params as unknown as Record<string, unknown>);

    try {
      const apiService = this.getApiService();
      const queryParams: Record<string, string> = {};
      if (params.search) queryParams.search = params.search;

      const result = await apiService.get("/api/explore", queryParams);
      return jsonResponse(result, `✅ Retrieved public content`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to explore public content");
    }
  }
}

export const explorePublicContentTool = new ExplorePublicContentTool();




