/**
 * Get Snippet Tool
 * 
 * Retrieves a specific code snippet by ID
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface GetSnippetParams {
  snippetId: string;
}

class GetSnippetTool extends BaseToolHandler implements BaseToolDefinition<GetSnippetParams> {
  name = "getSnippet";
  description = "Retrieve full details of a specific code snippet by ID, including the complete code, language, tags, description, and metadata. Use this after listSnippets to get the actual code content, or when the user references a snippet by ID.";
  
  paramsSchema = z.object({
    snippetId: z.string().describe("The ID of the snippet to retrieve"),
  });

  async execute(params: GetSnippetParams): Promise<FormattedResponse> {
    this.logStart(this.name, { snippetId: params.snippetId });

    try {
      const apiService = this.getApiService();
      const result = await apiService.get(`/api/snippets/${params.snippetId}`);
      return jsonResponse(result, `✅ Retrieved snippet: ${params.snippetId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to get snippet");
    }
  }
}

export const getSnippetTool = new GetSnippetTool();




