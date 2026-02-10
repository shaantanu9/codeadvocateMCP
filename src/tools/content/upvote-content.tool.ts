/**
 * Upvote Content Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface UpvoteContentParams {
  contentType: string;
  contentId: string;
}

class UpvoteContentTool extends BaseToolHandler implements BaseToolDefinition<UpvoteContentParams> {
  name = "upvoteContent";
  description = "Upvote a piece of content (snippet, documentation, etc.). Toggle: calling again removes the upvote.";

  paramsSchema = z.object({
    contentType: z.string().describe("Type of content: 'snippet', 'documentation', 'markdown', etc."),
    contentId: z.string().describe("The ID of the content to upvote"),
  });

  async execute(params: UpvoteContentParams): Promise<FormattedResponse> {
    this.logStart(this.name, { ...params });

    try {
      const apiService = this.getApiService();
      const result = await apiService.post(`/api/content/${params.contentType}/${params.contentId}/upvote`, {});
      return jsonResponse(result, `✅ Upvote toggled on ${params.contentType}: ${params.contentId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to upvote content");
    }
  }
}

export const upvoteContentTool = new UpvoteContentTool();
