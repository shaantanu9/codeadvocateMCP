/**
 * Create Code Snippet Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import { processTags } from "../../utils/tag-filter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface CreateCodeSnippetParams {
  title: string;
  code: string;
  language: string;
  description?: string;
  tags?: string[];
}

class CreateCodeSnippetTool extends BaseToolHandler implements BaseToolDefinition<CreateCodeSnippetParams> {
  name = "createCodeSnippet";
  description = "Create a new code snippet";
  
  paramsSchema = z.object({
    title: z.string().describe("Title of the code snippet"),
    code: z.string().describe("The code content"),
    language: z.string().describe("Programming language"),
    description: z.string().optional().describe("Description of the code snippet"),
    tags: z.array(z.string()).optional().describe("Tags for the code snippet"),
  });

  async execute(params: CreateCodeSnippetParams): Promise<FormattedResponse> {
    this.logStart(this.name, { title: params.title });

    try {
      const apiService = this.getApiService();
      const body: Record<string, unknown> = {
        title: params.title,
        code: params.code,
        language: params.language,
      };
      if (params.description) body.description = params.description;
      
      // Filter and process tags to remove IDs
      const filteredTags = processTags(params.tags);
      if (filteredTags.length > 0) body.tags = filteredTags;

      const result = await apiService.post("/api/code-snippets", body);
      return jsonResponse(result, `✅ Created code snippet: ${params.title}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to create code snippet");
    }
  }
}

export const createCodeSnippetTool = new CreateCodeSnippetTool();




