/**
 * Update Markdown Document Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface UpdateMarkdownDocumentParams {
  documentId: string;
  title?: string;
  documentType?: string;
  category?: string;
  content?: string;
  filePath?: string;
  tags?: string[];
}

class UpdateMarkdownDocumentTool extends BaseToolHandler implements BaseToolDefinition<UpdateMarkdownDocumentParams> {
  name = "updateMarkdownDocument";
  description = "Update a markdown document";
  
  paramsSchema = z.object({
    documentId: z.string().describe("The ID of the markdown document to update"),
    title: z.string().optional().describe("Title of the markdown document"),
    documentType: z.string().optional().describe("Document type"),
    category: z.string().optional().describe("Category"),
    content: z.string().optional().describe("Content of the markdown document"),
    filePath: z.string().optional().describe("File path"),
    tags: z.array(z.string()).optional().describe("Tags for the document"),
  });

  async execute(params: UpdateMarkdownDocumentParams): Promise<FormattedResponse> {
    this.logStart(this.name, { documentId: params.documentId });

    try {
      const apiService = this.getApiService();
      const body: Record<string, unknown> = {};
      if (params.title) body.title = params.title;
      if (params.documentType) body.document_type = params.documentType;
      if (params.category) body.category = params.category;
      if (params.content) body.content = params.content;
      if (params.filePath) body.file_path = params.filePath;
      if (params.tags) body.tags = params.tags;

      const result = await apiService.put(`/api/markdown-documents/${params.documentId}`, body);
      return jsonResponse(result, `✅ Updated markdown document: ${params.documentId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to update markdown document");
    }
  }
}

export const updateMarkdownDocumentTool = new UpdateMarkdownDocumentTool();




