/**
 * Get Repository Links Tool
 * 
 * Get all links for a repository (collections, teams, companies).
 */

import { z } from "zod";
import { BaseToolHandler } from "../../base/tool-handler.base.js";
import { jsonResponse } from "../../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../../base/base-tool.interface.js";
import type { FormattedResponse } from "../../../utils/response-formatter.js";

export interface GetRepositoryLinksParams {
  repositoryId: string;
}

class GetRepositoryLinksTool extends BaseToolHandler implements BaseToolDefinition<GetRepositoryLinksParams> {
  name = "getRepositoryLinks";
  description = "Get all links for a repository (collections, teams, companies)";
  
  paramsSchema = z.object({
    repositoryId: z.string().describe("The ID of the repository"),
  });

  async execute(params: GetRepositoryLinksParams): Promise<FormattedResponse> {
    const { startTime } = this.logStart(this.name, params as unknown as Record<string, unknown>);

    try {
      const apiService = this.getApiService();
      const result = await apiService.get(`/api/repositories/${params.repositoryId}/links`);
      
      this.logSuccess(this.name, params as unknown as Record<string, unknown>, startTime, {
        success: true,
        message: `Retrieved links for repository: ${params.repositoryId}`,
      });
      
      return jsonResponse(result, `✅ Retrieved links for repository: ${params.repositoryId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to get repository links", params as unknown as Record<string, unknown>, startTime);
    }
  }
}

export const getRepositoryLinksTool = new GetRepositoryLinksTool();

