/**
 * Delete Repository Mermaid Diagram Tool
 * 
 * Delete a Mermaid diagram.
 */

import { z } from "zod";
import { BaseToolHandler } from "../../base/tool-handler.base.js";
import { jsonResponse } from "../../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../../base/base-tool.interface.js";
import type { FormattedResponse } from "../../../utils/response-formatter.js";

export interface DeleteRepositoryMermaidParams {
  repositoryId: string;
  diagramId: string;
}

class DeleteRepositoryMermaidTool
  extends BaseToolHandler
  implements BaseToolDefinition<DeleteRepositoryMermaidParams>
{
  name = "deleteRepositoryMermaid";
  description = "Delete a Mermaid diagram";

  paramsSchema = z.object({
    repositoryId: z.string().describe("The ID of the repository"),
    diagramId: z.string().describe("The ID of the Mermaid diagram to delete"),
  });

  async execute(params: DeleteRepositoryMermaidParams): Promise<FormattedResponse> {
    const { startTime } = this.logStart(this.name, params as unknown as Record<string, unknown>);

    try {
      const apiService = this.getApiService();
      const result = await apiService.delete(
        `/api/repositories/${params.repositoryId}/mermaid/${params.diagramId}`
      );

      this.logSuccess(this.name, params as unknown as Record<string, unknown>, startTime, {
        success: true,
        message: `Deleted Mermaid diagram: ${params.diagramId}`,
      });

      return jsonResponse(
        result,
        `✅ Deleted Mermaid diagram: ${params.diagramId}`
      );
    } catch (error) {
      return this.handleError(
        this.name,
        error,
        "Failed to delete repository Mermaid diagram",
        params as unknown as Record<string, unknown>,
        startTime
      );
    }
  }
}

export const deleteRepositoryMermaidTool = new DeleteRepositoryMermaidTool();
