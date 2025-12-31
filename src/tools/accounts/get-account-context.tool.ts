/**
 * Get Account Context Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface GetAccountContextParams {
  // No parameters
}

class GetAccountContextTool extends BaseToolHandler implements BaseToolDefinition<GetAccountContextParams> {
  name = "getAccountContext";
  description = "Get account context information";
  
  paramsSchema = z.object({});

  async execute(_params: GetAccountContextParams): Promise<FormattedResponse> {
    this.logStart(this.name);

    try {
      const apiService = this.getApiService();
      const result = await apiService.get("/api/accounts/context");
      return jsonResponse(result, `✅ Retrieved account context`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to get account context");
    }
  }
}

export const getAccountContextTool = new GetAccountContextTool();




