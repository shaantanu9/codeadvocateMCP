/**
 * Get Code Snippet Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface GetCodeSnippetParams {
  snippetId: string;
}

class GetCodeSnippetTool extends BaseToolHandler implements BaseToolDefinition<GetCodeSnippetParams> {
  name = "getCodeSnippet";
  description = "Get a specific code snippet by ID";
  
  paramsSchema = z.object({
    snippetId: z.string().describe("The ID of the code snippet to retrieve"),
  });

  async execute(params: GetCodeSnippetParams): Promise<FormattedResponse> {
    this.logStart(this.name, { snippetId: params.snippetId });

    try {
      const apiService = this.getApiService();
      const result = await apiService.get(`/api/code-snippets/${params.snippetId}`);
      return jsonResponse(result, `✅ Retrieved code snippet: ${params.snippetId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to get code snippet");
    }
  }
}

export const getCodeSnippetTool = new GetCodeSnippetTool();




