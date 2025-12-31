/**
 * List Documentations Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface ListDocumentationsParams {
  search?: string;
  type?: string;
  category?: string;
  page?: number;
  limit?: number;
}

class ListDocumentationsTool extends BaseToolHandler implements BaseToolDefinition<ListDocumentationsParams> {
  name = "listDocumentations";
  description = "List documentations with search, type, and category filters";
  
  paramsSchema = z.object({
    search: z.string().optional().describe("Search term to filter documentations"),
    type: z.string().optional().describe("Filter by documentation type (e.g., service)"),
    category: z.string().optional().describe("Filter by category (e.g., backend)"),
    page: z.number().optional().default(1).describe("Page number for pagination"),
    limit: z.number().optional().default(20).describe("Number of items per page"),
  });

  async execute(params: ListDocumentationsParams): Promise<FormattedResponse> {
    this.logStart(this.name, params as Record<string, unknown>);

    try {
      const apiService = this.getApiService();
      const queryParams: Record<string, string | number> = {};
      if (params.search) queryParams.search = params.search;
      if (params.type) queryParams.type = params.type;
      if (params.category) queryParams.category = params.category;
      if (params.page) queryParams.page = params.page;
      if (params.limit) queryParams.limit = params.limit;

      const result = await apiService.get("/api/documentations", queryParams);
      return jsonResponse(result, `✅ Retrieved documentations`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to list documentations");
    }
  }
}

export const listDocumentationsTool = new ListDocumentationsTool();




