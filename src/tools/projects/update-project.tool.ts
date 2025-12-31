/**
 * Update Project Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface UpdateProjectParams {
  projectId: string;
  name?: string;
  description?: string;
  repositoryId?: string;
}

class UpdateProjectTool extends BaseToolHandler implements BaseToolDefinition<UpdateProjectParams> {
  name = "updateProject";
  description = "Update an existing project";
  
  paramsSchema = z.object({
    projectId: z.string().describe("The ID of the project to update"),
    name: z.string().optional().describe("Name of the project"),
    description: z.string().optional().describe("Description of the project"),
    repositoryId: z.string().optional().describe("Associated repository ID"),
  });

  async execute(params: UpdateProjectParams): Promise<FormattedResponse> {
    this.logStart(this.name, { projectId: params.projectId });

    try {
      const apiService = this.getApiService();
      const body: Record<string, unknown> = {};
      if (params.name) body.name = params.name;
      if (params.description) body.description = params.description;
      if (params.repositoryId) body.repositoryId = params.repositoryId;

      const result = await apiService.put(`/api/projects/${params.projectId}`, body);
      return jsonResponse(result, `✅ Updated project: ${params.projectId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to update project");
    }
  }
}

export const updateProjectTool = new UpdateProjectTool();




