/**
 * Trash Snippet Tool
 *
 * Moves a snippet to trash (soft delete). Can be restored later with restoreSnippet.
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface TrashSnippetParams {
  snippetId: string;
}

class TrashSnippetTool extends BaseToolHandler implements BaseToolDefinition<TrashSnippetParams> {
  name = "trashSnippet";
  description = "Move a snippet to trash (soft delete). The snippet can be restored later using restoreSnippet. Use deleteSnippet for permanent deletion.";

  paramsSchema = z.object({
    snippetId: z.string().describe("The ID of the snippet to move to trash"),
  });

  async execute(params: TrashSnippetParams): Promise<FormattedResponse> {
    this.logStart(this.name, { snippetId: params.snippetId });

    try {
      const apiService = this.getApiService();
      const result = await apiService.post(`/api/snippets/${params.snippetId}/trash`, {});
      return jsonResponse(result, `✅ Moved snippet to trash: ${params.snippetId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to trash snippet");
    }
  }
}

export const trashSnippetTool = new TrashSnippetTool();
