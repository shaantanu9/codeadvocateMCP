/**
 * Update Snippet Tool
 * 
 * Updates an existing code snippet
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface UpdateSnippetParams {
  snippetId: string;
  title?: string;
  code?: string;
  language?: string;
  description?: string;
  tags?: string[];
  projectId?: string;
  repositoryId?: string;
}

class UpdateSnippetTool extends BaseToolHandler implements BaseToolDefinition<UpdateSnippetParams> {
  name = "updateSnippet";
  description = "Update an existing code snippet";
  
  paramsSchema = z.object({
    snippetId: z.string().describe("The ID of the snippet to update"),
    title: z.string().optional().describe("Title of the snippet"),
    code: z.string().optional().describe("The code content"),
    language: z.string().optional().describe("Programming language"),
    description: z.string().optional().describe("Description of the snippet"),
    tags: z.array(z.string()).optional().describe("Tags for the snippet"),
    projectId: z.string().optional().describe("Associated project ID"),
    repositoryId: z.string().optional().describe("Associated repository ID"),
  });

  async execute(params: UpdateSnippetParams): Promise<FormattedResponse> {
    this.logStart(this.name, { snippetId: params.snippetId });

    try {
      const apiService = this.getApiService();
      const body: Record<string, unknown> = {};

      if (params.title) body.title = params.title;
      if (params.code) body.code = params.code;
      if (params.language) body.language = params.language;
      if (params.description) body.description = params.description;
      if (params.tags) body.tags = params.tags;
      if (params.projectId) body.projectId = params.projectId;
      if (params.repositoryId) body.repositoryId = params.repositoryId;

      const result = await apiService.put(`/api/snippets/${params.snippetId}`, body);
      return jsonResponse(result, `✅ Updated snippet: ${params.snippetId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to update snippet");
    }
  }
}

export const updateSnippetTool = new UpdateSnippetTool();




