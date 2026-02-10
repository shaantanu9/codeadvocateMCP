/**
 * Create Annotation Tool
 *
 * Creates a code review annotation on a snippet
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface CreateAnnotationParams {
  snippetId: string;
  content: string;
  lineStart?: number;
  lineEnd?: number;
  type?: string;
}

class CreateAnnotationTool extends BaseToolHandler implements BaseToolDefinition<CreateAnnotationParams> {
  name = "createAnnotation";
  description = "Create a code review annotation on a snippet. Can be a general comment or targeted at specific lines. Useful for AI-assisted code review.";

  paramsSchema = z.object({
    snippetId: z.string().describe("The ID of the snippet to annotate"),
    content: z.string().describe("The annotation content / review comment"),
    lineStart: z.number().optional().describe("Starting line number for line-specific annotations"),
    lineEnd: z.number().optional().describe("Ending line number for line-specific annotations"),
    type: z.string().optional().describe("Annotation type (e.g., suggestion, issue, praise)"),
  });

  async execute(params: CreateAnnotationParams): Promise<FormattedResponse> {
    this.logStart(this.name, { snippetId: params.snippetId });

    try {
      const apiService = this.getApiService();
      const body: Record<string, unknown> = { content: params.content };
      if (params.lineStart !== undefined) body.lineStart = params.lineStart;
      if (params.lineEnd !== undefined) body.lineEnd = params.lineEnd;
      if (params.type) body.type = params.type;
      const result = await apiService.post(`/api/snippets/${params.snippetId}/annotations`, body);
      return jsonResponse(result, `✅ Annotation created on snippet: ${params.snippetId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to create annotation");
    }
  }
}

export const createAnnotationTool = new CreateAnnotationTool();
