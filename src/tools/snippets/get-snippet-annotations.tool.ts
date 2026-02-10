/**
 * Get Snippet Annotations Tool
 *
 * Retrieves code review annotations/comments for a snippet
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface GetSnippetAnnotationsParams {
  snippetId: string;
  type?: string;
}

class GetSnippetAnnotationsTool extends BaseToolHandler implements BaseToolDefinition<GetSnippetAnnotationsParams> {
  name = "getSnippetAnnotations";
  description = "Get code review annotations and comments for a snippet. Annotations include line-specific feedback, suggestions, and review comments.";

  paramsSchema = z.object({
    snippetId: z.string().describe("The ID of the snippet"),
    type: z.string().optional().describe("Filter by annotation type"),
  });

  async execute(params: GetSnippetAnnotationsParams): Promise<FormattedResponse> {
    this.logStart(this.name, { snippetId: params.snippetId });

    try {
      const apiService = this.getApiService();
      const queryParams: Record<string, string> = {};
      if (params.type) queryParams.type = params.type;
      const result = await apiService.get(`/api/snippets/${params.snippetId}/annotations`, queryParams);
      return jsonResponse(result, `✅ Annotations for snippet: ${params.snippetId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to get snippet annotations");
    }
  }
}

export const getSnippetAnnotationsTool = new GetSnippetAnnotationsTool();
