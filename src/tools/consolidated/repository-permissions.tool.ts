/**
 * Consolidated Repository Permissions Tool
 *
 * Combines all repository permission operations into a single tool with an action parameter.
 * Actions: get, grant, revoke
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import { buildQueryParams } from "../../utils/query-params.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

const ACTIONS = ["get", "grant", "revoke"] as const;

interface Params {
  action: (typeof ACTIONS)[number];
  repositoryId?: string;
  userId?: string;
  companyId?: string;
  permission?: string;
}

class RepositoryPermissionsTool extends BaseToolHandler implements BaseToolDefinition<Params> {
  name = "repositoryPermissions";

  description = `Manage repository permissions. Use 'action' to specify operation:
- get: Get current permissions (requires: repositoryId)
- grant: Grant permission (requires: repositoryId, permission; at least one of userId or companyId)
- revoke: Revoke permission (requires: repositoryId; at least one of userId or companyId)`;

  paramsSchema = z.object({
    action: z.enum(ACTIONS).describe("Operation to perform"),
    repositoryId: z.string().optional().describe("Repository ID. Required for all actions."),
    userId: z.string().optional().describe("User ID. Required for grant/revoke if companyId not provided."),
    companyId: z.string().optional().describe("Company ID. Required for grant/revoke if userId not provided."),
    permission: z.enum(["read", "write", "admin"]).optional().describe("Permission level. Required for: grant"),
  });

  annotations = { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true };

  async execute(params: Params): Promise<FormattedResponse> {
    const api = this.getApiService();
    switch (params.action) {
      case "get": {
        const repositoryId = this.requireParam(params.repositoryId, "repositoryId", "get");
        const { startTime } = this.logStart(`${this.name}.get`, { repositoryId });
        try {
          const result = await api.get(`/api/repositories/${repositoryId}/permissions`);
          this.logSuccess(`${this.name}.get`, { repositoryId }, startTime);
          return jsonResponse(result, `✅ Retrieved permissions for repository: ${repositoryId}`);
        } catch (error) {
          return this.handleError(`${this.name}.get`, error, "Failed to get permissions", { repositoryId }, startTime);
        }
      }
      case "grant": {
        const repositoryId = this.requireParam(params.repositoryId, "repositoryId", "grant");
        const permission = this.requireParam(params.permission, "permission", "grant");
        if (!params.userId && !params.companyId) {
          return this.handleError(`${this.name}.grant`, new Error("At least one of userId or companyId must be provided"), "Missing required parameter");
        }
        const { startTime } = this.logStart(`${this.name}.grant`, { repositoryId, permission });
        try {
          const body: Record<string, unknown> = {
            permission,
          };
          if (params.userId !== undefined) body.user_id = params.userId;
          if (params.companyId !== undefined) body.company_id = params.companyId;

          const result = await api.post(`/api/repositories/${repositoryId}/permissions`, body);
          this.logSuccess(`${this.name}.grant`, { repositoryId, permission }, startTime);
          return jsonResponse(result, `✅ Granted ${permission} permission for repository: ${repositoryId}`);
        } catch (error) {
          return this.handleError(`${this.name}.grant`, error, "Failed to grant permission", { repositoryId, permission }, startTime);
        }
      }
      case "revoke": {
        const repositoryId = this.requireParam(params.repositoryId, "repositoryId", "revoke");
        if (!params.userId && !params.companyId) {
          return this.handleError(`${this.name}.revoke`, new Error("At least one of userId or companyId must be provided"), "Missing required parameter");
        }
        const { startTime } = this.logStart(`${this.name}.revoke`, { repositoryId });
        try {
          const queryParams = buildQueryParams(
            {
              userId: params.userId,
              companyId: params.companyId,
            },
            {
              userId: "user_id",
              companyId: "company_id",
            }
          );
          const result = await api.delete(`/api/repositories/${repositoryId}/permissions`, queryParams);
          this.logSuccess(`${this.name}.revoke`, { repositoryId }, startTime);
          return jsonResponse(result, `✅ Revoked permission for repository: ${repositoryId}`);
        } catch (error) {
          return this.handleError(`${this.name}.revoke`, error, "Failed to revoke permission", { repositoryId }, startTime);
        }
      }
      default:
        return this.handleError(this.name, new Error(`Unknown action: ${params.action}`), `Unknown action`);
    }
  }
}

export const repositoryPermissionsTool = new RepositoryPermissionsTool();
