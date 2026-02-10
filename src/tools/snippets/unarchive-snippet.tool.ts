/**
 * Unarchive Snippet Tool
 *
 * Restores a snippet from the archive back to active state
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface UnarchiveSnippetParams {
  snippetId: string;
}

class UnarchiveSnippetTool extends BaseToolHandler implements BaseToolDefinition<UnarchiveSnippetParams> {
  name = "unarchiveSnippet";
  description = "Restore a snippet from the archive back to active state. Use getArchivedSnippets to see archived snippets first.";

  paramsSchema = z.object({
    snippetId: z.string().describe("The ID of the archived snippet to restore"),
  });

  async execute(params: UnarchiveSnippetParams): Promise<FormattedResponse> {
    this.logStart(this.name, { snippetId: params.snippetId });

    try {
      const apiService = this.getApiService();
      const result = await apiService.post(`/api/snippets/${params.snippetId}/unarchive`, {});
      return jsonResponse(result, `✅ Unarchived snippet: ${params.snippetId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to unarchive snippet");
    }
  }
}

export const unarchiveSnippetTool = new UnarchiveSnippetTool();
