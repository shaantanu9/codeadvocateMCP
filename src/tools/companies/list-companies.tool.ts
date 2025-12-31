/**
 * List Companies Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import {
  buildQueryParams,
  buildPaginationParams,
} from "../../utils/query-params.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface ListCompaniesParams {
  page?: number;
  limit?: number;
}

class ListCompaniesTool
  extends BaseToolHandler
  implements BaseToolDefinition<ListCompaniesParams>
{
  name = "listCompanies";
  description = "List companies";

  paramsSchema = z.object({
    page: z
      .number()
      .int()
      .min(1)
      .optional()
      .default(1)
      .describe("Page number for pagination"),
    limit: z
      .number()
      .int()
      .min(1)
      .max(100)
      .optional()
      .default(20)
      .describe("Number of items per page (max: 100)"),
  });

  async execute(params: ListCompaniesParams): Promise<FormattedResponse> {
    const { startTime } = this.logStart(
      this.name,
      params as Record<string, unknown>
    );

    try {
      const apiService = this.getApiService();

      // Build pagination params with validation
      const pagination = buildPaginationParams(
        params.page,
        params.limit,
        1,
        20,
        100
      );

      // Build query params
      const queryParams = buildQueryParams({
        page: pagination.page,
        limit: pagination.limit,
      });

      const result = await apiService.get("/api/companies", queryParams);

      this.logSuccess(this.name, params as Record<string, unknown>, startTime, {
        success: true,
        message: "Retrieved companies",
      });

      return jsonResponse(result, `✅ Retrieved companies`);
    } catch (error) {
      return this.handleError(
        this.name,
        error,
        "Failed to list companies",
        params as Record<string, unknown>,
        startTime
      );
    }
  }
}

export const listCompaniesTool = new ListCompaniesTool();
