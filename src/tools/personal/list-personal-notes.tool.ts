/**
 * List Personal Notes Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface ListPersonalNotesParams {
  search?: string;
  tags?: string;
  category?: string;
  favorite?: boolean;
  page?: number;
  limit?: number;
}

class ListPersonalNotesTool extends BaseToolHandler implements BaseToolDefinition<ListPersonalNotesParams> {
  name = "listPersonalNotes";
  description = "List personal notes with search, tags, category, and favorite filters";
  
  paramsSchema = z.object({
    search: z.string().optional().describe("Search term to filter notes"),
    tags: z.string().optional().describe("Comma-separated tags to filter"),
    category: z.string().optional().describe("Filter by category"),
    favorite: z.boolean().optional().describe("Filter by favorite status"),
    page: z.number().optional().default(1).describe("Page number for pagination"),
    limit: z.number().optional().default(20).describe("Number of items per page"),
  });

  async execute(params: ListPersonalNotesParams): Promise<FormattedResponse> {
    this.logStart(this.name, params as Record<string, unknown>);

    try {
      const apiService = this.getApiService();
      const queryParams: Record<string, string | number | boolean> = {};
      if (params.search) queryParams.search = params.search;
      if (params.tags) queryParams.tags = params.tags;
      if (params.category) queryParams.category = params.category;
      if (params.favorite !== undefined) queryParams.favorite = params.favorite;
      if (params.page) queryParams.page = params.page;
      if (params.limit) queryParams.limit = params.limit;

      const result = await apiService.get("/api/personal/notes", queryParams);
      return jsonResponse(result, `✅ Retrieved personal notes`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to list personal notes");
    }
  }
}

export const listPersonalNotesTool = new ListPersonalNotesTool();




