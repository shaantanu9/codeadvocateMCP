/**
 * Delete Personal Note Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface DeleteNoteParams {
  noteId: string;
}

class DeleteNoteTool extends BaseToolHandler implements BaseToolDefinition<DeleteNoteParams> {
  name = "deletePersonalNote";
  description = "Delete a personal knowledge note permanently.";

  paramsSchema = z.object({
    noteId: z.string().describe("The ID of the note to delete"),
  });

  async execute(params: DeleteNoteParams): Promise<FormattedResponse> {
    this.logStart(this.name, { noteId: params.noteId });

    try {
      const apiService = this.getApiService();
      const result = await apiService.delete(`/api/personal/notes/${params.noteId}`);
      return jsonResponse(result, `✅ Note deleted: ${params.noteId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to delete note");
    }
  }
}

export const deleteNoteTool = new DeleteNoteTool();
