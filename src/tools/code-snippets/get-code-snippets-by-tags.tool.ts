/**
 * Get Code Snippets By Tags Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface GetCodeSnippetsByTagsParams {
  tags: string;
}

class GetCodeSnippetsByTagsTool extends BaseToolHandler implements BaseToolDefinition<GetCodeSnippetsByTagsParams> {
  name = "getCodeSnippetsByTags";
  description = "Get code snippets filtered by tags";
  
  paramsSchema = z.object({
    tags: z.string().describe("Comma-separated tags to filter"),
  });

  async execute(params: GetCodeSnippetsByTagsParams): Promise<FormattedResponse> {
    this.logStart(this.name, { tags: params.tags });

    try {
      const apiService = this.getApiService();
      const queryParams: Record<string, string> = { tags: params.tags };

      const result = await apiService.get("/api/code-snippets/by-tags", queryParams);
      return jsonResponse(result, `✅ Retrieved code snippets by tags: ${params.tags}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to get code snippets by tags");
    }
  }
}

export const getCodeSnippetsByTagsTool = new GetCodeSnippetsByTagsTool();




