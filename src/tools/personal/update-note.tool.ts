/**
 * Update Personal Note Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface UpdateNoteParams {
  noteId: string;
  title?: string;
  content?: string;
  tags?: string[];
}

class UpdateNoteTool extends BaseToolHandler implements BaseToolDefinition<UpdateNoteParams> {
  name = "updatePersonalNote";
  description = "Update an existing personal knowledge note. Only provided fields will be updated.";

  paramsSchema = z.object({
    noteId: z.string().describe("The ID of the note to update"),
    title: z.string().optional().describe("New title for the note"),
    content: z.string().optional().describe("New content for the note (supports markdown)"),
    tags: z.array(z.string()).optional().describe("Updated tags for the note"),
  });

  async execute(params: UpdateNoteParams): Promise<FormattedResponse> {
    this.logStart(this.name, { noteId: params.noteId });

    try {
      const apiService = this.getApiService();
      const body: Record<string, unknown> = {};
      if (params.title !== undefined) body.title = params.title;
      if (params.content !== undefined) body.content = params.content;
      if (params.tags !== undefined) body.tags = params.tags;
      const result = await apiService.put(`/api/personal/notes/${params.noteId}`, body);
      return jsonResponse(result, `✅ Note updated: ${params.noteId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to update note");
    }
  }
}

export const updateNoteTool = new UpdateNoteTool();
