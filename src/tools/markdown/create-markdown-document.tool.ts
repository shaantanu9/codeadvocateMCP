/**
 * Create Markdown Document Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import { processTags } from "../../utils/tag-filter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface CreateMarkdownDocumentParams {
  title: string;
  documentType?: string;
  category?: string;
  content: string;
  filePath?: string;
  tags?: string[];
}

class CreateMarkdownDocumentTool extends BaseToolHandler implements BaseToolDefinition<CreateMarkdownDocumentParams> {
  name = "createMarkdownDocument";
  description = "Create a new markdown document";
  
  paramsSchema = z.object({
    title: z.string().describe("Title of the markdown document"),
    documentType: z.string().optional().describe("Document type (e.g., guide)"),
    category: z.string().optional().describe("Category (e.g., api)"),
    content: z.string().describe("Content of the markdown document"),
    filePath: z.string().optional().describe("File path (e.g., /docs)"),
    tags: z.array(z.string()).optional().describe("Tags for the document"),
  });

  async execute(params: CreateMarkdownDocumentParams): Promise<FormattedResponse> {
    this.logStart(this.name, { title: params.title });

    try {
      const apiService = this.getApiService();
      const body: Record<string, unknown> = {
        title: params.title,
        content: params.content,
      };
      if (params.documentType) body.document_type = params.documentType;
      if (params.category) body.category = params.category;
      if (params.filePath) body.file_path = params.filePath;
      
      // Filter and process tags to remove IDs
      const filteredTags = processTags(params.tags);
      if (filteredTags.length > 0) body.tags = filteredTags;

      const result = await apiService.post("/api/markdown-documents", body);
      return jsonResponse(result, `✅ Created markdown document: ${params.title}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to create markdown document");
    }
  }
}

export const createMarkdownDocumentTool = new CreateMarkdownDocumentTool();




