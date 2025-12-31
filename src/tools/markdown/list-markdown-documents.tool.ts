/**
 * List Markdown Documents Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface ListMarkdownDocumentsParams {
  search?: string;
  documentType?: string;
  category?: string;
  tags?: string;
  filePath?: string;
  page?: number;
  limit?: number;
}

class ListMarkdownDocumentsTool extends BaseToolHandler implements BaseToolDefinition<ListMarkdownDocumentsParams> {
  name = "listMarkdownDocuments";
  description = "List markdown documents with search, type, category, tags, and file path filters";
  
  paramsSchema = z.object({
    search: z.string().optional().describe("Search term to filter documents"),
    documentType: z.string().optional().describe("Filter by document type (e.g., guide)"),
    category: z.string().optional().describe("Filter by category (e.g., api)"),
    tags: z.string().optional().describe("Comma-separated tags to filter"),
    filePath: z.string().optional().describe("Filter by file path (e.g., /docs)"),
    page: z.number().optional().default(1).describe("Page number for pagination"),
    limit: z.number().optional().default(20).describe("Number of items per page"),
  });

  async execute(params: ListMarkdownDocumentsParams): Promise<FormattedResponse> {
    this.logStart(this.name, params as unknown as Record<string, unknown>);

    try {
      const apiService = this.getApiService();
      const queryParams: Record<string, string | number> = {};
      if (params.search) queryParams.search = params.search;
      if (params.documentType) queryParams.document_type = params.documentType;
      if (params.category) queryParams.category = params.category;
      if (params.tags) queryParams.tags = params.tags;
      if (params.filePath) queryParams.file_path = params.filePath;
      if (params.page) queryParams.page = params.page;
      if (params.limit) queryParams.limit = params.limit;

      const result = await apiService.get("/api/markdown-documents", queryParams);
      return jsonResponse(result, `✅ Retrieved markdown documents`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to list markdown documents");
    }
  }
}

export const listMarkdownDocumentsTool = new ListMarkdownDocumentsTool();




