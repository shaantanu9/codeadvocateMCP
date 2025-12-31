/**
 * List Projects Tool
 * 
 * Lists projects from the external API with filtering and pagination
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface ListProjectsParams {
  search?: string;
  teamId?: string;
  page?: number;
  limit?: number;
}

class ListProjectsTool extends BaseToolHandler implements BaseToolDefinition<ListProjectsParams> {
  name = "listProjects";
  description = "List projects from the external API with search, filters, and pagination";
  
  paramsSchema = z.object({
    search: z.string().optional().describe("Search term to filter projects"),
    teamId: z.string().optional().describe("Filter by team ID"),
    page: z.number().optional().default(1).describe("Page number for pagination"),
    limit: z.number().optional().default(20).describe("Number of items per page"),
  });

  async execute(params: ListProjectsParams): Promise<FormattedResponse> {
    this.logStart(this.name, params as unknown as Record<string, unknown>);

    try {
      const apiService = this.getApiService();
      const queryParams: Record<string, string | number> = {};
      
      if (params.search) queryParams.search = params.search;
      if (params.teamId) queryParams.teamId = params.teamId;
      if (params.page) queryParams.page = params.page;
      if (params.limit) queryParams.limit = params.limit;

      const result = await apiService.get("/api/projects", queryParams);
      return jsonResponse(
        result,
        `✅ Retrieved projects (Page ${params.page || 1})`
      );
    } catch (error) {
      return this.handleError(this.name, error, "Failed to list projects");
    }
  }
}

export const listProjectsTool = new ListProjectsTool();




