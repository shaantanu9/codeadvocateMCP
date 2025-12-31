/**
 * Call External API Tool
 * 
 * Generic tool for making any API call to the external API
 * Provides flexibility for endpoints not covered by specific tools
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface CallExternalApiParams {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  endpoint: string;
  body?: Record<string, unknown>;
  queryParams?: Record<string, string | number | boolean>;
}

class CallExternalApiTool extends BaseToolHandler implements BaseToolDefinition<CallExternalApiParams> {
  name = "callExternalAPI";
  description = "Make a generic API call to the external API. Use this for endpoints not covered by specific tools";
  
  paramsSchema = z.object({
    method: z
      .enum(["GET", "POST", "PUT", "PATCH", "DELETE"])
      .describe("HTTP method"),
    endpoint: z
      .string()
      .describe("API endpoint (e.g., /api/snippets, /api/projects)"),
    body: z
      .record(z.unknown())
      .optional()
      .describe("Request body (for POST/PUT/PATCH)"),
    queryParams: z
      .record(z.union([z.string(), z.number(), z.boolean()]))
      .optional()
      .describe("Query parameters"),
  });

  async execute(params: CallExternalApiParams): Promise<FormattedResponse> {
    this.logStart(this.name, { method: params.method, endpoint: params.endpoint });

    try {
      const apiService = this.getApiService();
      let result;

      switch (params.method) {
        case "GET":
          result = await apiService.get(params.endpoint, params.queryParams);
          break;
        case "POST":
          result = await apiService.post(params.endpoint, params.body, params.queryParams);
          break;
        case "PUT":
          result = await apiService.put(params.endpoint, params.body, params.queryParams);
          break;
        case "PATCH":
          result = await apiService.patch(params.endpoint, params.body, params.queryParams);
          break;
        case "DELETE":
          result = await apiService.delete(params.endpoint, params.queryParams);
          break;
      }

      return jsonResponse(
        result,
        `✅ API call successful: ${params.method} ${params.endpoint}`
      );
    } catch (error) {
      return this.handleError(this.name, error, "Failed to call external API");
    }
  }
}

export const callExternalApiTool = new CallExternalApiTool();




