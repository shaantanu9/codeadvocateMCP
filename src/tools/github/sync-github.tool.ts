/**
 * Sync GitHub Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SyncGithubParams {}

class SyncGithubTool extends BaseToolHandler implements BaseToolDefinition<SyncGithubParams> {
  name = "syncGithub";
  description = "Trigger a sync of your GitHub repositories. Imports new repos and updates existing ones.";

  paramsSchema = z.object({});

  async execute(_params: SyncGithubParams): Promise<FormattedResponse> {
    this.logStart(this.name, {});

    try {
      const apiService = this.getApiService();
      const result = await apiService.post("/api/integrations/github/sync", {});
      return jsonResponse(result, "✅ GitHub sync triggered");
    } catch (error) {
      return this.handleError(this.name, error, "Failed to sync GitHub");
    }
  }
}

export const syncGithubTool = new SyncGithubTool();
