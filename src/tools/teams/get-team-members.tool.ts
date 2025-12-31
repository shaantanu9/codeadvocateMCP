/**
 * Get Team Members Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface GetTeamMembersParams {
  teamId: string;
}

class GetTeamMembersTool extends BaseToolHandler implements BaseToolDefinition<GetTeamMembersParams> {
  name = "getTeamMembers";
  description = "Get members of a specific team";
  
  paramsSchema = z.object({
    teamId: z.string().describe("The ID of the team"),
  });

  async execute(params: GetTeamMembersParams): Promise<FormattedResponse> {
    this.logStart(this.name, { teamId: params.teamId });

    try {
      const apiService = this.getApiService();
      const result = await apiService.get(`/api/teams/${params.teamId}/members`);
      return jsonResponse(result, `✅ Retrieved team members for team: ${params.teamId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to get team members");
    }
  }
}

export const getTeamMembersTool = new GetTeamMembersTool();




