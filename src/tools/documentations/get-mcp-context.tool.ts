/**
 * Get MCP Context Tool
 * 
 * Gets MCP-specific context from documentations
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface GetMcpContextParams {
  // No parameters needed
}

class GetMcpContextTool extends BaseToolHandler implements BaseToolDefinition<GetMcpContextParams> {
  name = "getMcpContext";
  description = "Get MCP context from documentations";
  
  paramsSchema = z.object({});

  async execute(_params: GetMcpContextParams): Promise<FormattedResponse> {
    this.logStart(this.name);

    try {
      const apiService = this.getApiService();
      const result = await apiService.get("/api/documentations/mcp/context");
      return jsonResponse(result, `✅ Retrieved MCP context`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to get MCP context");
    }
  }
}

export const getMcpContextTool = new GetMcpContextTool();




