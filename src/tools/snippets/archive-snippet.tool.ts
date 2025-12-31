/**
 * Archive Snippet Tool
 * 
 * Archives a snippet
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface ArchiveSnippetParams {
  snippetId: string;
}

class ArchiveSnippetTool extends BaseToolHandler implements BaseToolDefinition<ArchiveSnippetParams> {
  name = "archiveSnippet";
  description = "Archive a snippet";
  
  paramsSchema = z.object({
    snippetId: z.string().describe("The ID of the snippet to archive"),
  });

  async execute(params: ArchiveSnippetParams): Promise<FormattedResponse> {
    this.logStart(this.name, { snippetId: params.snippetId });

    try {
      const apiService = this.getApiService();
      const result = await apiService.post(`/api/snippets/${params.snippetId}/archive`, {});
      return jsonResponse(result, `✅ Archived snippet: ${params.snippetId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to archive snippet");
    }
  }
}

export const archiveSnippetTool = new ArchiveSnippetTool();




