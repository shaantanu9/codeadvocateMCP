/**
 * Delete Snippet Tool
 *
 * Deletes a snippet by ID
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface DeleteSnippetParams {
  snippetId: string;
}

class DeleteSnippetTool extends BaseToolHandler implements BaseToolDefinition<DeleteSnippetParams> {
  name = "deleteSnippet";
  description = "Delete a code snippet permanently. Use trashSnippet for soft-delete instead if you want to be able to restore it later.";

  paramsSchema = z.object({
    snippetId: z.string().describe("The ID of the snippet to delete"),
  });

  async execute(params: DeleteSnippetParams): Promise<FormattedResponse> {
    this.logStart(this.name, { snippetId: params.snippetId });

    try {
      const apiService = this.getApiService();
      const result = await apiService.delete(`/api/snippets/${params.snippetId}`);
      return jsonResponse(result, `✅ Deleted snippet: ${params.snippetId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to delete snippet");
    }
  }
}

export const deleteSnippetTool = new DeleteSnippetTool();
