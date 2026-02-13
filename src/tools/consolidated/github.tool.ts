/**
 * Consolidated GitHub Tool
 *
 * Combines GitHub integration operations into a single tool with an action parameter.
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

const ACTIONS = ["getStatus", "sync", "getSettings", "importFromGithub"] as const;

type GithubAction = (typeof ACTIONS)[number];

interface GithubParams {
  action: GithubAction;
  repoFullName?: string;
  importAll?: boolean;
}

class GithubTool extends BaseToolHandler implements BaseToolDefinition<GithubParams> {
  name = "github";

  description = `Manage GitHub integration. Use 'action' to specify operation:
- getStatus: Check GitHub integration status (no params)
- sync: Trigger a sync with GitHub (no params)
- getSettings: Get GitHub integration settings (no params)
- importFromGithub: Import repositories from GitHub (optional: repoFullName as "owner/repo", importAll)`;

  paramsSchema = z.object({
    action: z.enum(ACTIONS).describe("Operation to perform"),
    repoFullName: z.string().optional().describe("Repository full name in format 'owner/repo'. Used by: importFromGithub"),
    importAll: z.boolean().optional().describe("Import all repositories. Used by: importFromGithub"),
  });

  annotations = {
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
  };

  async execute(params: GithubParams): Promise<FormattedResponse> {
    const api = this.getApiService();

    switch (params.action) {
      case "getStatus": {
        const { startTime } = this.logStart(`${this.name}.getStatus`, {});
        try {
          const result = await api.get("/api/integrations/github/status");
          this.logSuccess(`${this.name}.getStatus`, {}, startTime);
          return jsonResponse(result, "✅ Retrieved GitHub integration status");
        } catch (error) {
          return this.handleError(`${this.name}.getStatus`, error, "Failed to get GitHub status", {}, startTime);
        }
      }
      case "sync": {
        const { startTime } = this.logStart(`${this.name}.sync`, {});
        try {
          const result = await api.post("/api/integrations/github/sync", {});
          this.logSuccess(`${this.name}.sync`, {}, startTime);
          return jsonResponse(result, "✅ GitHub sync triggered");
        } catch (error) {
          return this.handleError(`${this.name}.sync`, error, "Failed to sync with GitHub", {}, startTime);
        }
      }
      case "getSettings": {
        const { startTime } = this.logStart(`${this.name}.getSettings`, {});
        try {
          const result = await api.get("/api/integrations/github/settings");
          this.logSuccess(`${this.name}.getSettings`, {}, startTime);
          return jsonResponse(result, "✅ Retrieved GitHub integration settings");
        } catch (error) {
          return this.handleError(`${this.name}.getSettings`, error, "Failed to get GitHub settings", {}, startTime);
        }
      }
      case "importFromGithub": {
        const { startTime } = this.logStart(`${this.name}.importFromGithub`, params as unknown as Record<string, unknown>);
        try {
          const body: Record<string, unknown> = {};
          if (params.repoFullName) body.repoFullName = params.repoFullName;
          if (params.importAll !== undefined) body.importAll = params.importAll;

          const result = await api.post("/api/integrations/github/import", body);
          this.logSuccess(`${this.name}.importFromGithub`, params as unknown as Record<string, unknown>, startTime);
          return jsonResponse(result, "✅ GitHub import initiated");
        } catch (error) {
          return this.handleError(`${this.name}.importFromGithub`, error, "Failed to import from GitHub", params as unknown as Record<string, unknown>, startTime);
        }
      }
      default:
        return this.handleError(this.name, new Error(`Unknown action: ${params.action}`), `Unknown action`);
    }
  }
}

export const githubTool = new GithubTool();
