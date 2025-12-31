/**
 * Get Team Projects Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface GetTeamProjectsParams {
  teamId: string;
}

class GetTeamProjectsTool extends BaseToolHandler implements BaseToolDefinition<GetTeamProjectsParams> {
  name = "getTeamProjects";
  description = "Get projects for a specific team";
  
  paramsSchema = z.object({
    teamId: z.string().describe("The ID of the team"),
  });

  async execute(params: GetTeamProjectsParams): Promise<FormattedResponse> {
    this.logStart(this.name, { teamId: params.teamId });

    try {
      const apiService = this.getApiService();
      const result = await apiService.get(`/api/teams/${params.teamId}/projects`);
      return jsonResponse(result, `✅ Retrieved team projects for team: ${params.teamId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to get team projects");
    }
  }
}

export const getTeamProjectsTool = new GetTeamProjectsTool();




