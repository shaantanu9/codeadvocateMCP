/**
 * Manage Personal Tags Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ListTagsParams {}

class ListTagsTool extends BaseToolHandler implements BaseToolDefinition<ListTagsParams> {
  name = "listPersonalTags";
  description = "List all tags used in your personal knowledge base for notes, links, and files.";

  paramsSchema = z.object({});

  async execute(_params: ListTagsParams): Promise<FormattedResponse> {
    this.logStart(this.name, {});

    try {
      const apiService = this.getApiService();
      const result = await apiService.get("/api/personal/tags");
      return jsonResponse(result, "✅ Tags retrieved");
    } catch (error) {
      return this.handleError(this.name, error, "Failed to list tags");
    }
  }
}

export const listTagsTool = new ListTagsTool();
