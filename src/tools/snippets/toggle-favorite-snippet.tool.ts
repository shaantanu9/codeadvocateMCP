/**
 * Toggle Favorite Snippet Tool
 * 
 * Toggles the favorite status of a snippet
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface ToggleFavoriteSnippetParams {
  snippetId: string;
}

class ToggleFavoriteSnippetTool extends BaseToolHandler implements BaseToolDefinition<ToggleFavoriteSnippetParams> {
  name = "toggleFavoriteSnippet";
  description = "Toggle the favorite status of a snippet";
  
  paramsSchema = z.object({
    snippetId: z.string().describe("The ID of the snippet to toggle favorite"),
  });

  async execute(params: ToggleFavoriteSnippetParams): Promise<FormattedResponse> {
    this.logStart(this.name, { snippetId: params.snippetId });

    try {
      const apiService = this.getApiService();
      const result = await apiService.post(`/api/snippets/${params.snippetId}/favorite`, {});
      return jsonResponse(result, `✅ Toggled favorite status for snippet: ${params.snippetId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to toggle favorite snippet");
    }
  }
}

export const toggleFavoriteSnippetTool = new ToggleFavoriteSnippetTool();




