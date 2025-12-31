/**
 * Get Documentation Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface GetDocumentationParams {
  documentationId: string;
}

class GetDocumentationTool extends BaseToolHandler implements BaseToolDefinition<GetDocumentationParams> {
  name = "getDocumentation";
  description = "Get a specific documentation by ID";
  
  paramsSchema = z.object({
    documentationId: z.string().describe("The ID of the documentation to retrieve"),
  });

  async execute(params: GetDocumentationParams): Promise<FormattedResponse> {
    this.logStart(this.name, { documentationId: params.documentationId });

    try {
      const apiService = this.getApiService();
      const result = await apiService.get(`/api/documentations/${params.documentationId}`);
      return jsonResponse(result, `✅ Retrieved documentation: ${params.documentationId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to get documentation");
    }
  }
}

export const getDocumentationTool = new GetDocumentationTool();




