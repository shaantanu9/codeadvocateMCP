/**
 * Get Accessible Repositories Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface GetAccessibleRepositoriesParams {
  // No parameters
}

class GetAccessibleRepositoriesTool extends BaseToolHandler implements BaseToolDefinition<GetAccessibleRepositoriesParams> {
  name = "getAccessibleRepositories";
  description = "Get list of accessible repositories based on permissions";
  
  paramsSchema = z.object({});

  async execute(_params: GetAccessibleRepositoriesParams): Promise<FormattedResponse> {
    this.logStart(this.name);

    try {
      const apiService = this.getApiService();
      const result = await apiService.get("/api/permissions/repositories");
      return jsonResponse(result, `✅ Retrieved accessible repositories`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to get accessible repositories");
    }
  }
}

export const getAccessibleRepositoriesTool = new GetAccessibleRepositoriesTool();




