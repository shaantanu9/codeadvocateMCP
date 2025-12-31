/**
 * Get Repository Mermaid Diagram Tool
 * 
 * Get a specific Mermaid diagram by ID.
 */

import { z } from "zod";
import { BaseToolHandler } from "../../base/tool-handler.base.js";
import { jsonResponse } from "../../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../../base/base-tool.interface.js";
import type { FormattedResponse } from "../../../utils/response-formatter.js";

export interface GetRepositoryMermaidParams {
  repositoryId: string;
  diagramId: string;
}

class GetRepositoryMermaidTool
  extends BaseToolHandler
  implements BaseToolDefinition<GetRepositoryMermaidParams>
{
  name = "getRepositoryMermaid";
  description = "Get a specific Mermaid diagram by ID";

  paramsSchema = z.object({
    repositoryId: z.string().describe("The ID of the repository"),
    diagramId: z.string().describe("The ID of the Mermaid diagram"),
  });

  async execute(params: GetRepositoryMermaidParams): Promise<FormattedResponse> {
    const { startTime } = this.logStart(this.name, params as unknown as Record<string, unknown>);

    try {
      const apiService = this.getApiService();
      const result = await apiService.get(
        `/api/repositories/${params.repositoryId}/mermaid/${params.diagramId}`
      );

      this.logSuccess(this.name, params as unknown as Record<string, unknown>, startTime, {
        success: true,
        message: `Retrieved Mermaid diagram: ${params.diagramId}`,
      });

      return jsonResponse(
        result,
        `✅ Retrieved Mermaid diagram: ${params.diagramId}`
      );
    } catch (error) {
      return this.handleError(
        this.name,
        error,
        "Failed to get repository Mermaid diagram",
        params as unknown as Record<string, unknown>,
        startTime
      );
    }
  }
}

export const getRepositoryMermaidTool = new GetRepositoryMermaidTool();
