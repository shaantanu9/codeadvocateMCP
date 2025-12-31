/**
 * Create Repository Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface CreateRepositoryParams {
  name: string;
  description?: string;
  type?: "individual" | "company";
}

class CreateRepositoryTool extends BaseToolHandler implements BaseToolDefinition<CreateRepositoryParams> {
  name = "createRepository";
  description = "Create a new repository";
  
  paramsSchema = z.object({
    name: z.string().describe("Name of the repository"),
    description: z.string().optional().describe("Description of the repository"),
    type: z.enum(["individual", "company"]).optional().describe("Repository type"),
  });

  async execute(params: CreateRepositoryParams): Promise<FormattedResponse> {
    const { startTime } = this.logStart(this.name, params as unknown as Record<string, unknown>);

    try {
      const apiService = this.getApiService();
      const body: Record<string, unknown> = { name: params.name };
      if (params.description) body.description = params.description;
      if (params.type) body.type = params.type;

      const result = await apiService.post("/api/repositories", body);
      
      this.logSuccess(this.name, params as unknown as Record<string, unknown>, startTime, {
        success: true,
        message: `Created repository: ${params.name}`,
      });
      
      return jsonResponse(result, `✅ Created repository: ${params.name}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to create repository", params as unknown as Record<string, unknown>, startTime);
    }
  }
}

export const createRepositoryTool = new CreateRepositoryTool();


