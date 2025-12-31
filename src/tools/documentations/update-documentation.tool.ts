/**
 * Update Documentation Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface UpdateDocumentationParams {
  documentationId: string;
  title?: string;
  type?: string;
  category?: string;
  content?: string;
  metadata?: Record<string, unknown>;
}

class UpdateDocumentationTool extends BaseToolHandler implements BaseToolDefinition<UpdateDocumentationParams> {
  name = "updateDocumentation";
  description = "Update a documentation";
  
  paramsSchema = z.object({
    documentationId: z.string().describe("The ID of the documentation to update"),
    title: z.string().optional().describe("Title of the documentation"),
    type: z.string().optional().describe("Type of documentation"),
    category: z.string().optional().describe("Category"),
    content: z.string().optional().describe("Content of the documentation"),
    metadata: z.record(z.unknown()).optional().describe("Additional metadata"),
  });

  async execute(params: UpdateDocumentationParams): Promise<FormattedResponse> {
    this.logStart(this.name, { documentationId: params.documentationId });

    try {
      const apiService = this.getApiService();
      const body: Record<string, unknown> = {};
      if (params.title) body.title = params.title;
      if (params.type) body.type = params.type;
      if (params.category) body.category = params.category;
      if (params.content) body.content = params.content;
      if (params.metadata) body.metadata = params.metadata;

      const result = await apiService.put(`/api/documentations/${params.documentationId}`, body);
      return jsonResponse(result, `✅ Updated documentation: ${params.documentationId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to update documentation");
    }
  }
}

export const updateDocumentationTool = new UpdateDocumentationTool();




