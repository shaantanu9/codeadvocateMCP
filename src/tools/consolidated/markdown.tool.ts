/**
 * Markdown Tool (Consolidated)
 *
 * Manages markdown documents.
 * Actions: list, get, create, update
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import { processTags } from "../../utils/tag-filter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

interface MarkdownParams {
  action: "list" | "get" | "create" | "update";
  documentId?: string;
  title?: string;
  content?: string;
  documentType?: string;
  category?: string;
  tags?: string[] | string;
  filePath?: string;
  search?: string;
  page?: number;
  limit?: number;
}

class MarkdownTool
  extends BaseToolHandler
  implements BaseToolDefinition<MarkdownParams>
{
  name = "markdown";
  description =
    "Manage markdown documents. Supports listing, getting, creating, and updating markdown documents with tags, categories, and file paths.";

  paramsSchema = z.object({
    action: z
      .enum(["list", "get", "create", "update"])
      .describe("The action to perform"),
    documentId: z.string().optional().describe("The document ID (required for get, update)"),
    title: z.string().optional().describe("Document title (required for create)"),
    content: z.string().optional().describe("Document content (required for create)"),
    documentType: z.string().optional().describe("Document type"),
    category: z.string().optional().describe("Document category"),
    tags: z
      .union([z.array(z.string()), z.string()])
      .optional()
      .describe("Tags for the document (string for list filtering, string[] for create/update)"),
    filePath: z.string().optional().describe("File path associated with the document"),
    search: z.string().optional().describe("Search query for filtering documents"),
    page: z.number().optional().describe("Page number for pagination"),
    limit: z.number().optional().describe("Number of items per page"),
  });

  annotations = {
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
  };

  async execute(params: MarkdownParams): Promise<FormattedResponse> {
    const { startTime } = this.logStart(this.name, params as unknown as Record<string, unknown>);

    try {
      const apiService = this.getApiService();
      let result: unknown;

      switch (params.action) {
        case "list": {
          const query: Record<string, string | number | boolean> = {};
          if (params.search) query.search = params.search;
          if (params.documentType) query.document_type = params.documentType;
          if (params.category) query.category = params.category;
          if (params.tags) query.tags = typeof params.tags === "string" ? params.tags : params.tags.join(",");
          if (params.filePath) query.file_path = params.filePath;
          if (params.page) query.page = params.page;
          if (params.limit) query.limit = params.limit;
          result = await apiService.get("/api/markdown-documents", query);
          break;
        }

        case "get": {
          const documentId = this.requireParam(params.documentId, "documentId", "get");
          result = await apiService.get(`/api/markdown-documents/${documentId}`);
          break;
        }

        case "create": {
          const title = this.requireParam(params.title, "title", "create");
          const content = this.requireParam(params.content, "content", "create");
          const body: Record<string, unknown> = { title, content };
          if (params.documentType) body.document_type = params.documentType;
          if (params.category) body.category = params.category;
          if (params.filePath) body.file_path = params.filePath;
          if (params.tags) {
            const tagsArray = Array.isArray(params.tags) ? params.tags : [params.tags];
            body.tags = processTags(tagsArray);
          }
          result = await apiService.post("/api/markdown-documents", body);
          break;
        }

        case "update": {
          const documentId = this.requireParam(params.documentId, "documentId", "update");
          const body: Record<string, unknown> = {};
          if (params.title) body.title = params.title;
          if (params.content) body.content = params.content;
          if (params.documentType) body.document_type = params.documentType;
          if (params.category) body.category = params.category;
          if (params.filePath) body.file_path = params.filePath;
          if (params.tags) {
            const tagsArray = Array.isArray(params.tags) ? params.tags : [params.tags];
            body.tags = processTags(tagsArray);
          }
          result = await apiService.put(`/api/markdown-documents/${documentId}`, body);
          break;
        }
      }

      this.logSuccess(this.name, params as unknown as Record<string, unknown>, startTime, {
        success: true,
        message: `markdown.${params.action} completed`,
      });

      return jsonResponse(result, `markdown.${params.action} completed successfully`);
    } catch (error) {
      return this.handleError(
        this.name,
        error,
        `Failed to execute markdown.${params.action}`,
        params as unknown as Record<string, unknown>,
        startTime
      );
    }
  }
}

export const markdownTool = new MarkdownTool();
