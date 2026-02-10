/**
 * Create Personal Link Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface CreateLinkParams {
  url: string;
  title?: string;
  description?: string;
  tags?: string[];
}

class CreateLinkTool extends BaseToolHandler implements BaseToolDefinition<CreateLinkParams> {
  name = "createPersonalLink";
  description = "Save a new link to your personal knowledge base. Great for bookmarking useful resources, documentation, and references.";

  paramsSchema = z.object({
    url: z.string().describe("The URL to save"),
    title: z.string().optional().describe("Custom title for the link"),
    description: z.string().optional().describe("Description or notes about the link"),
    tags: z.array(z.string()).optional().describe("Tags for categorizing the link"),
  });

  async execute(params: CreateLinkParams): Promise<FormattedResponse> {
    this.logStart(this.name, { url: params.url });

    try {
      const apiService = this.getApiService();
      const result = await apiService.post("/api/personal/links", {
        url: params.url,
        title: params.title,
        description: params.description,
        tags: params.tags,
      });
      return jsonResponse(result, `✅ Link saved: ${params.url}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to create link");
    }
  }
}

export const createLinkTool = new CreateLinkTool();
