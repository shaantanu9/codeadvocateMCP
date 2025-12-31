/**
 * List Personal Files Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface ListPersonalFilesParams {
  search?: string;
  tags?: string;
  category?: string;
  fileType?: string;
  page?: number;
  limit?: number;
}

class ListPersonalFilesTool extends BaseToolHandler implements BaseToolDefinition<ListPersonalFilesParams> {
  name = "listPersonalFiles";
  description = "List personal files with search, tags, category, and file type filters";
  
  paramsSchema = z.object({
    search: z.string().optional().describe("Search term to filter files"),
    tags: z.string().optional().describe("Comma-separated tags to filter"),
    category: z.string().optional().describe("Filter by category"),
    fileType: z.string().optional().describe("Filter by file type"),
    page: z.number().optional().default(1).describe("Page number for pagination"),
    limit: z.number().optional().default(20).describe("Number of items per page"),
  });

  async execute(params: ListPersonalFilesParams): Promise<FormattedResponse> {
    this.logStart(this.name, params as unknown as Record<string, unknown>);

    try {
      const apiService = this.getApiService();
      const queryParams: Record<string, string | number> = {};
      if (params.search) queryParams.search = params.search;
      if (params.tags) queryParams.tags = params.tags;
      if (params.category) queryParams.category = params.category;
      if (params.fileType) queryParams.fileType = params.fileType;
      if (params.page) queryParams.page = params.page;
      if (params.limit) queryParams.limit = params.limit;

      const result = await apiService.get("/api/personal/files", queryParams);
      return jsonResponse(result, `✅ Retrieved personal files`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to list personal files");
    }
  }
}

export const listPersonalFilesTool = new ListPersonalFilesTool();




