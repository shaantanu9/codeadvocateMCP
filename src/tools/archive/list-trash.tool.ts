/**
 * List Trash Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface ListTrashParams {
  type?: "snippets" | "projects" | "all";
  page?: number;
  limit?: number;
}

class ListTrashTool extends BaseToolHandler implements BaseToolDefinition<ListTrashParams> {
  name = "listTrash";
  description = "List trashed items (snippets, projects, or all)";
  
  paramsSchema = z.object({
    type: z.enum(["snippets", "projects", "all"]).optional().describe("Filter by type"),
    page: z.number().optional().default(1).describe("Page number for pagination"),
    limit: z.number().optional().default(20).describe("Number of items per page"),
  });

  async execute(params: ListTrashParams): Promise<FormattedResponse> {
    this.logStart(this.name, params as unknown as Record<string, unknown>);

    try {
      const apiService = this.getApiService();
      const queryParams: Record<string, string | number> = {};
      if (params.type) queryParams.type = params.type;
      if (params.page) queryParams.page = params.page;
      if (params.limit) queryParams.limit = params.limit;

      const result = await apiService.get("/api/trash", queryParams);
      return jsonResponse(result, `✅ Retrieved trashed items`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to list trash");
    }
  }
}

export const listTrashTool = new ListTrashTool();




