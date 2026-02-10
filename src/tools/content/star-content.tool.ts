/**
 * Star Content Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface StarContentParams {
  contentType: string;
  contentId: string;
}

class StarContentTool extends BaseToolHandler implements BaseToolDefinition<StarContentParams> {
  name = "starContent";
  description = "Star/bookmark a piece of content for quick access later. Toggle: calling again removes the star.";

  paramsSchema = z.object({
    contentType: z.string().describe("Type of content: 'snippet', 'documentation', 'markdown', etc."),
    contentId: z.string().describe("The ID of the content to star"),
  });

  async execute(params: StarContentParams): Promise<FormattedResponse> {
    this.logStart(this.name, { ...params });

    try {
      const apiService = this.getApiService();
      const result = await apiService.post(`/api/content/${params.contentType}/${params.contentId}/star`, {});
      return jsonResponse(result, `✅ Star toggled on ${params.contentType}: ${params.contentId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to star content");
    }
  }
}

export const starContentTool = new StarContentTool();
