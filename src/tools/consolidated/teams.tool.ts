/**
 * Consolidated Teams Tool
 *
 * Combines team listing, member, and project operations into a single tool with an action parameter.
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

const ACTIONS = ["list", "getMembers", "getProjects"] as const;

type TeamsAction = (typeof ACTIONS)[number];

interface TeamsParams {
  action: TeamsAction;
  teamId?: string;
  page?: number;
  limit?: number;
}

class TeamsTool extends BaseToolHandler implements BaseToolDefinition<TeamsParams> {
  name = "teams";

  description = `Manage and view teams. Use 'action' to specify operation:
- list: List all teams (optional: page, limit)
- getMembers: Get team members (requires: teamId)
- getProjects: Get team projects (requires: teamId)`;

  paramsSchema = z.object({
    action: z.enum(ACTIONS).describe("Operation to perform"),
    teamId: z.string().optional().describe("Team ID. Required for: getMembers, getProjects"),
    page: z.number().optional().describe("Page number (default: 1). Used by: list"),
    limit: z.number().optional().describe("Items per page (default: 20). Used by: list"),
  });

  annotations = {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  };

  async execute(params: TeamsParams): Promise<FormattedResponse> {
    const api = this.getApiService();

    switch (params.action) {
      case "list": {
        const { startTime } = this.logStart(`${this.name}.list`, params as unknown as Record<string, unknown>);
        try {
          const queryParams: Record<string, string | number | boolean> = {};
          if (params.page) queryParams.page = params.page;
          if (params.limit) queryParams.limit = params.limit;

          const result = await api.get("/api/teams", queryParams);
          this.logSuccess(`${this.name}.list`, params as unknown as Record<string, unknown>, startTime);
          return jsonResponse(result, `✅ Retrieved teams (Page ${params.page || 1}, Limit ${params.limit || 20})`);
        } catch (error) {
          return this.handleError(`${this.name}.list`, error, "Failed to list teams", params as unknown as Record<string, unknown>, startTime);
        }
      }
      case "getMembers": {
        const teamId = this.requireParam(params.teamId, "teamId", "getMembers");
        const { startTime } = this.logStart(`${this.name}.getMembers`, { teamId });
        try {
          const result = await api.get(`/api/teams/${teamId}/members`);
          this.logSuccess(`${this.name}.getMembers`, { teamId }, startTime);
          return jsonResponse(result, `✅ Retrieved members for team: ${teamId}`);
        } catch (error) {
          return this.handleError(`${this.name}.getMembers`, error, "Failed to get team members", { teamId }, startTime);
        }
      }
      case "getProjects": {
        const teamId = this.requireParam(params.teamId, "teamId", "getProjects");
        const { startTime } = this.logStart(`${this.name}.getProjects`, { teamId });
        try {
          const result = await api.get(`/api/teams/${teamId}/projects`);
          this.logSuccess(`${this.name}.getProjects`, { teamId }, startTime);
          return jsonResponse(result, `✅ Retrieved projects for team: ${teamId}`);
        } catch (error) {
          return this.handleError(`${this.name}.getProjects`, error, "Failed to get team projects", { teamId }, startTime);
        }
      }
      default:
        return this.handleError(this.name, new Error(`Unknown action: ${params.action}`), `Unknown action`);
    }
  }
}

export const teamsTool = new TeamsTool();
