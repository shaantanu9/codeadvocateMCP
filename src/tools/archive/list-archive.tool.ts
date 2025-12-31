/**
 * List Archive Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface ListArchiveParams {
  type?: "snippets" | "projects" | "all";
  page?: number;
  limit?: number;
}

class ListArchiveTool extends BaseToolHandler implements BaseToolDefinition<ListArchiveParams> {
  name = "listArchive";
  description = "List archived items (snippets, projects, or all)";
  
  paramsSchema = z.object({
    type: z.enum(["snippets", "projects", "all"]).optional().describe("Filter by type"),
    page: z.number().optional().default(1).describe("Page number for pagination"),
    limit: z.number().optional().default(20).describe("Number of items per page"),
  });

  async execute(params: ListArchiveParams): Promise<FormattedResponse> {
    this.logStart(this.name, params as Record<string, unknown>);

    try {
      const apiService = this.getApiService();
      const queryParams: Record<string, string | number> = {};
      if (params.type) queryParams.type = params.type;
      if (params.page) queryParams.page = params.page;
      if (params.limit) queryParams.limit = params.limit;

      const result = await apiService.get("/api/archive", queryParams);
      return jsonResponse(result, `✅ Retrieved archived items`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to list archive");
    }
  }
}

export const listArchiveTool = new ListArchiveTool();




