/**
 * Create Personal Note Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface CreateNoteParams {
  title: string;
  content: string;
  tags?: string[];
}

class CreateNoteTool extends BaseToolHandler implements BaseToolDefinition<CreateNoteParams> {
  name = "createPersonalNote";
  description = "Create a new personal knowledge note. Notes support markdown and can be tagged for organization.";

  paramsSchema = z.object({
    title: z.string().describe("The note title"),
    content: z.string().describe("The note content (supports markdown)"),
    tags: z.array(z.string()).optional().describe("Tags for categorizing the note"),
  });

  async execute(params: CreateNoteParams): Promise<FormattedResponse> {
    this.logStart(this.name, { title: params.title });

    try {
      const apiService = this.getApiService();
      const result = await apiService.post("/api/personal/notes", {
        title: params.title,
        content: params.content,
        tags: params.tags,
      });
      return jsonResponse(result, `✅ Note created: ${params.title}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to create note");
    }
  }
}

export const createNoteTool = new CreateNoteTool();
