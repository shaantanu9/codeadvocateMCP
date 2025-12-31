/**
 * Get Markdown Document Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface GetMarkdownDocumentParams {
  documentId: string;
}

class GetMarkdownDocumentTool extends BaseToolHandler implements BaseToolDefinition<GetMarkdownDocumentParams> {
  name = "getMarkdownDocument";
  description = "Get a specific markdown document by ID";
  
  paramsSchema = z.object({
    documentId: z.string().describe("The ID of the markdown document to retrieve"),
  });

  async execute(params: GetMarkdownDocumentParams): Promise<FormattedResponse> {
    this.logStart(this.name, { documentId: params.documentId });

    try {
      const apiService = this.getApiService();
      const result = await apiService.get(`/api/markdown-documents/${params.documentId}`);
      return jsonResponse(result, `✅ Retrieved markdown document: ${params.documentId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to get markdown document");
    }
  }
}

export const getMarkdownDocumentTool = new GetMarkdownDocumentTool();




