/**
 * Consolidated Archive Tool
 *
 * Combines archive and trash listing operations into a single tool with an action parameter.
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

const ACTIONS = ["listArchive", "listTrash"] as const;

type ArchiveAction = (typeof ACTIONS)[number];

interface ArchiveParams {
  action: ArchiveAction;
  type?: "snippets" | "projects" | "all";
  page?: number;
  limit?: number;
}

class ArchiveTool extends BaseToolHandler implements BaseToolDefinition<ArchiveParams> {
  name = "archive";

  description = `Browse archived and trashed items. Use 'action' to specify operation:
- listArchive: List archived items (optional: type, page, limit)
- listTrash: List trashed items (optional: type, page, limit)`;

  paramsSchema = z.object({
    action: z.enum(ACTIONS).describe("Operation to perform"),
    type: z.enum(["snippets", "projects", "all"]).optional().describe("Filter by item type"),
    page: z.number().optional().describe("Page number (default: 1)"),
    limit: z.number().optional().describe("Items per page (default: 20)"),
  });

  annotations = {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  };

  async execute(params: ArchiveParams): Promise<FormattedResponse> {
    const api = this.getApiService();

    switch (params.action) {
      case "listArchive": {
        const { startTime } = this.logStart(`${this.name}.listArchive`, params as unknown as Record<string, unknown>);
        try {
          const queryParams: Record<string, string | number | boolean> = {};
          if (params.type) queryParams.type = params.type;
          if (params.page) queryParams.page = params.page;
          if (params.limit) queryParams.limit = params.limit;

          const result = await api.get("/api/archive", queryParams);
          this.logSuccess(`${this.name}.listArchive`, params as unknown as Record<string, unknown>, startTime);
          return jsonResponse(result, `✅ Retrieved archived items (Page ${params.page || 1}, Limit ${params.limit || 20})`);
        } catch (error) {
          return this.handleError(`${this.name}.listArchive`, error, "Failed to list archived items", params as unknown as Record<string, unknown>, startTime);
        }
      }
      case "listTrash": {
        const { startTime } = this.logStart(`${this.name}.listTrash`, params as unknown as Record<string, unknown>);
        try {
          const queryParams: Record<string, string | number | boolean> = {};
          if (params.type) queryParams.type = params.type;
          if (params.page) queryParams.page = params.page;
          if (params.limit) queryParams.limit = params.limit;

          const result = await api.get("/api/trash", queryParams);
          this.logSuccess(`${this.name}.listTrash`, params as unknown as Record<string, unknown>, startTime);
          return jsonResponse(result, `✅ Retrieved trashed items (Page ${params.page || 1}, Limit ${params.limit || 20})`);
        } catch (error) {
          return this.handleError(`${this.name}.listTrash`, error, "Failed to list trashed items", params as unknown as Record<string, unknown>, startTime);
        }
      }
      default:
        return this.handleError(this.name, new Error(`Unknown action: ${params.action}`), `Unknown action`);
    }
  }
}

export const archiveTool = new ArchiveTool();
