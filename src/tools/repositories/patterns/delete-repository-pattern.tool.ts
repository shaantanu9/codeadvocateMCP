/**
 * Delete Repository Pattern Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../../base/tool-handler.base.js";
import { jsonResponse } from "../../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../../base/base-tool.interface.js";
import type { FormattedResponse } from "../../../utils/response-formatter.js";

export interface DeleteRepositoryPatternParams {
  repositoryId: string;
  patternId: string;
}

class DeleteRepositoryPatternTool
  extends BaseToolHandler
  implements BaseToolDefinition<DeleteRepositoryPatternParams>
{
  name = "deleteRepositoryPattern";
  description =
    "Delete a coding pattern from a repository. This action cannot be undone.";

  paramsSchema = z.object({
    repositoryId: z.string().describe("The ID of the repository"),
    patternId: z.string().describe("The ID of the pattern to delete"),
  });

  async execute(
    params: DeleteRepositoryPatternParams
  ): Promise<FormattedResponse> {
    const { startTime } = this.logStart(this.name, { ...params } as Record<
      string,
      unknown
    >);

    try {
      const apiService = this.getApiService();
      const result = await apiService.delete(
        `/api/repositories/${params.repositoryId}/patterns/${params.patternId}`
      );

      this.logSuccess(
        this.name,
        { ...params } as Record<string, unknown>,
        startTime,
        {
          success: true,
          message: `Deleted pattern ${params.patternId} from repository: ${params.repositoryId}`,
        }
      );

      return jsonResponse(
        result,
        `✅ Deleted pattern ${params.patternId} from repository: ${params.repositoryId}`
      );
    } catch (error) {
      return this.handleError(
        this.name,
        error,
        "Failed to delete repository pattern",
        { ...params } as Record<string, unknown>,
        startTime
      );
    }
  }
}

export const deleteRepositoryPatternTool = new DeleteRepositoryPatternTool();
