/**
 * Restore Snippet Tool
 *
 * Restores a snippet from trash back to active state
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface RestoreSnippetParams {
  snippetId: string;
}

class RestoreSnippetTool extends BaseToolHandler implements BaseToolDefinition<RestoreSnippetParams> {
  name = "restoreSnippet";
  description = "Restore a snippet from trash back to active state. Use listTrash to see trashed snippets first.";

  paramsSchema = z.object({
    snippetId: z.string().describe("The ID of the trashed snippet to restore"),
  });

  async execute(params: RestoreSnippetParams): Promise<FormattedResponse> {
    this.logStart(this.name, { snippetId: params.snippetId });

    try {
      const apiService = this.getApiService();
      const result = await apiService.post(`/api/snippets/${params.snippetId}/restore`, {});
      return jsonResponse(result, `✅ Restored snippet from trash: ${params.snippetId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to restore snippet");
    }
  }
}

export const restoreSnippetTool = new RestoreSnippetTool();
