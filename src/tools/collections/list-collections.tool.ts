/**
 * List Collections Tool
 * 
 * Lists collections from the external API with search and pagination
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface ListCollectionsParams {
  search?: string;
  page?: number;
  limit?: number;
}

class ListCollectionsTool extends BaseToolHandler implements BaseToolDefinition<ListCollectionsParams> {
  name = "listCollections";
  description = "List collections from the external API with search and pagination";
  
  paramsSchema = z.object({
    search: z.string().optional().describe("Search term to filter collections"),
    page: z.number().optional().default(1).describe("Page number for pagination"),
    limit: z.number().optional().default(20).describe("Number of items per page"),
  });

  async execute(params: ListCollectionsParams): Promise<FormattedResponse> {
    this.logStart(this.name, params as unknown as Record<string, unknown>);

    try {
      const apiService = this.getApiService();
      const queryParams: Record<string, string | number> = {};
      
      if (params.search) queryParams.search = params.search;
      if (params.page) queryParams.page = params.page;
      if (params.limit) queryParams.limit = params.limit;

      const result = await apiService.get("/api/collections", queryParams);
      return jsonResponse(result, `✅ Retrieved collections`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to list collections");
    }
  }
}

export const listCollectionsTool = new ListCollectionsTool();




