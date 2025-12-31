/**
 * Get Project Snippets Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface GetProjectSnippetsParams {
  projectId: string;
  page?: number;
  limit?: number;
}

class GetProjectSnippetsTool extends BaseToolHandler implements BaseToolDefinition<GetProjectSnippetsParams> {
  name = "getProjectSnippets";
  description = "Get snippets for a project";
  
  paramsSchema = z.object({
    projectId: z.string().describe("The ID of the project"),
    page: z.number().optional().default(1).describe("Page number for pagination"),
    limit: z.number().optional().default(20).describe("Number of items per page"),
  });

  async execute(params: GetProjectSnippetsParams): Promise<FormattedResponse> {
    this.logStart(this.name, { projectId: params.projectId });

    try {
      const apiService = this.getApiService();
      const queryParams: Record<string, number> = {};
      if (params.page) queryParams.page = params.page;
      if (params.limit) queryParams.limit = params.limit;

      const result = await apiService.get(`/api/projects/${params.projectId}/snippets`, queryParams);
      return jsonResponse(result, `✅ Retrieved snippets for project: ${params.projectId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to get project snippets");
    }
  }
}

export const getProjectSnippetsTool = new GetProjectSnippetsTool();




