/**
 * Get Snippet Count Tool
 *
 * Returns the total count of snippets for the current user
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface GetSnippetCountParams {
  language?: string;
}

class GetSnippetCountTool extends BaseToolHandler implements BaseToolDefinition<GetSnippetCountParams> {
  name = "getSnippetCount";
  description = "Get the total number of snippets for the current user. Useful for getting an overview of the snippet library size.";

  paramsSchema = z.object({
    language: z.string().optional().describe("Optional language filter to count snippets for a specific language"),
  });

  async execute(params: GetSnippetCountParams): Promise<FormattedResponse> {
    this.logStart(this.name, { ...params });

    try {
      const apiService = this.getApiService();
      const queryParams: Record<string, string> = {};
      if (params.language) queryParams.language = params.language;
      const result = await apiService.get("/api/snippets/count", queryParams);
      return jsonResponse(result, "✅ Retrieved snippet count");
    } catch (error) {
      return this.handleError(this.name, error, "Failed to get snippet count");
    }
  }
}

export const getSnippetCountTool = new GetSnippetCountTool();
