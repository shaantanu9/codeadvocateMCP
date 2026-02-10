/**
 * Add Comment Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface AddCommentParams {
  contentType: string;
  contentId: string;
  body: string;
  parentId?: string;
}

class AddCommentTool extends BaseToolHandler implements BaseToolDefinition<AddCommentParams> {
  name = "addComment";
  description = "Add a comment to any content (snippet, documentation, etc.). Supports threaded replies via parentId.";

  paramsSchema = z.object({
    contentType: z.string().describe("Type of content: 'snippet', 'documentation', 'markdown', etc."),
    contentId: z.string().describe("The ID of the content to comment on"),
    body: z.string().describe("The comment body (supports markdown)"),
    parentId: z.string().optional().describe("Parent comment ID for threaded replies"),
  });

  async execute(params: AddCommentParams): Promise<FormattedResponse> {
    this.logStart(this.name, { contentType: params.contentType, contentId: params.contentId });

    try {
      const apiService = this.getApiService();
      const result = await apiService.post(`/api/content/${params.contentType}/${params.contentId}/comments`, {
        body: params.body,
        parentId: params.parentId,
      });
      return jsonResponse(result, `✅ Comment added to ${params.contentType}: ${params.contentId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to add comment");
    }
  }
}

export const addCommentTool = new AddCommentTool();
