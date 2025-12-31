/**
 * Get Project Tool
 * 
 * Retrieves a specific project by ID
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface GetProjectParams {
  projectId: string;
}

class GetProjectTool extends BaseToolHandler implements BaseToolDefinition<GetProjectParams> {
  name = "getProject";
  description = "Get a specific project by ID";
  
  paramsSchema = z.object({
    projectId: z.string().describe("The ID of the project to retrieve"),
  });

  async execute(params: GetProjectParams): Promise<FormattedResponse> {
    this.logStart(this.name, { projectId: params.projectId });

    try {
      const apiService = this.getApiService();
      const result = await apiService.get(`/api/projects/${params.projectId}`);
      return jsonResponse(result, `✅ Retrieved project: ${params.projectId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to get project");
    }
  }
}

export const getProjectTool = new GetProjectTool();




