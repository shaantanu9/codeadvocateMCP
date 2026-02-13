/**
 * Consolidated Content Tool
 *
 * Combines content interaction operations (upvote, star, comment) into a single tool with an action parameter.
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

const ACTIONS = ["upvote", "star", "addComment"] as const;

type ContentAction = (typeof ACTIONS)[number];

interface ContentParams {
  action: ContentAction;
  contentType: string;
  contentId: string;
  body?: string;
  parentId?: string;
}

class ContentTool extends BaseToolHandler implements BaseToolDefinition<ContentParams> {
  name = "content";

  description = `Interact with content items. Use 'action' to specify operation:
- upvote: Upvote a content item (requires: contentType, contentId)
- star: Star/bookmark a content item (requires: contentType, contentId)
- addComment: Add a comment to a content item (requires: contentType, contentId, body; optional: parentId for threaded replies)`;

  paramsSchema = z.object({
    action: z.enum(ACTIONS).describe("Operation to perform"),
    contentType: z.string().describe("Type of content (e.g., snippet, documentation, question)"),
    contentId: z.string().describe("ID of the content item"),
    body: z.string().optional().describe("Comment text. Required for: addComment"),
    parentId: z.string().optional().describe("Parent comment ID for threaded replies. Used by: addComment"),
  });

  annotations = {
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
  };

  async execute(params: ContentParams): Promise<FormattedResponse> {
    const api = this.getApiService();
    const contentType = this.requireParam(params.contentType, "contentType", params.action);
    const contentId = this.requireParam(params.contentId, "contentId", params.action);

    switch (params.action) {
      case "upvote": {
        const { startTime } = this.logStart(`${this.name}.upvote`, { contentType, contentId });
        try {
          const result = await api.post(`/api/content/${contentType}/${contentId}/upvote`, {});
          this.logSuccess(`${this.name}.upvote`, { contentType, contentId }, startTime);
          return jsonResponse(result, `✅ Upvoted ${contentType}: ${contentId}`);
        } catch (error) {
          return this.handleError(`${this.name}.upvote`, error, "Failed to upvote content", { contentType, contentId }, startTime);
        }
      }
      case "star": {
        const { startTime } = this.logStart(`${this.name}.star`, { contentType, contentId });
        try {
          const result = await api.post(`/api/content/${contentType}/${contentId}/star`, {});
          this.logSuccess(`${this.name}.star`, { contentType, contentId }, startTime);
          return jsonResponse(result, `✅ Starred ${contentType}: ${contentId}`);
        } catch (error) {
          return this.handleError(`${this.name}.star`, error, "Failed to star content", { contentType, contentId }, startTime);
        }
      }
      case "addComment": {
        const commentBody = this.requireParam(params.body, "body", "addComment");
        const { startTime } = this.logStart(`${this.name}.addComment`, { contentType, contentId });
        try {
          const requestBody: Record<string, unknown> = { body: commentBody };
          if (params.parentId) requestBody.parentId = params.parentId;

          const result = await api.post(`/api/content/${contentType}/${contentId}/comments`, requestBody);
          this.logSuccess(`${this.name}.addComment`, { contentType, contentId }, startTime);
          return jsonResponse(result, `✅ Comment added to ${contentType}: ${contentId}`);
        } catch (error) {
          return this.handleError(`${this.name}.addComment`, error, "Failed to add comment", { contentType, contentId }, startTime);
        }
      }
      default:
        return this.handleError(this.name, new Error(`Unknown action: ${params.action}`), `Unknown action`);
    }
  }
}

export const contentTool = new ContentTool();
