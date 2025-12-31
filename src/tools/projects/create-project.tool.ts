/**
 * Create Project Tool
 * 
 * Creates a new project
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface CreateProjectParams {
  name: string;
  description?: string;
  repositoryId?: string;
}

class CreateProjectTool extends BaseToolHandler implements BaseToolDefinition<CreateProjectParams> {
  name = "createProject";
  description = "Create a new project";
  
  paramsSchema = z.object({
    name: z.string().describe("Name of the project"),
    description: z.string().optional().describe("Description of the project"),
    repositoryId: z.string().optional().describe("Associated repository ID"),
  });

  async execute(params: CreateProjectParams): Promise<FormattedResponse> {
    this.logStart(this.name, { name: params.name });

    try {
      const apiService = this.getApiService();
      const body: Record<string, unknown> = {
        name: params.name,
      };

      if (params.description) body.description = params.description;
      if (params.repositoryId) body.repositoryId = params.repositoryId;

      const result = await apiService.post("/api/projects", body);
      return jsonResponse(result, `✅ Created project: ${params.name}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to create project");
    }
  }
}

export const createProjectTool = new CreateProjectTool();




