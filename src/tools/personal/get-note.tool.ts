/**
 * Get Personal Note Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface GetNoteParams {
  noteId: string;
}

class GetNoteTool extends BaseToolHandler implements BaseToolDefinition<GetNoteParams> {
  name = "getPersonalNote";
  description = "Get a specific personal knowledge note by ID.";

  paramsSchema = z.object({
    noteId: z.string().describe("The ID of the note to retrieve"),
  });

  async execute(params: GetNoteParams): Promise<FormattedResponse> {
    this.logStart(this.name, { noteId: params.noteId });

    try {
      const apiService = this.getApiService();
      const result = await apiService.get(`/api/personal/notes/${params.noteId}`);
      return jsonResponse(result, `✅ Note retrieved: ${params.noteId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to get note");
    }
  }
}

export const getNoteTool = new GetNoteTool();
