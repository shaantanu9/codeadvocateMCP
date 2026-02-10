/**
 * Import from GitHub Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface ImportFromGithubParams {
  repoFullName?: string;
  importAll?: boolean;
}

class ImportFromGithubTool extends BaseToolHandler implements BaseToolDefinition<ImportFromGithubParams> {
  name = "importFromGithub";
  description = "Import repositories or code from GitHub into your CodeAdvocate account.";

  paramsSchema = z.object({
    repoFullName: z.string().optional().describe("Full repo name to import (e.g., 'owner/repo')"),
    importAll: z.boolean().optional().describe("Import all connected GitHub repositories"),
  });

  async execute(params: ImportFromGithubParams): Promise<FormattedResponse> {
    this.logStart(this.name, { ...params });

    try {
      const apiService = this.getApiService();
      const result = await apiService.post("/api/integrations/github/import", {
        repoFullName: params.repoFullName,
        importAll: params.importAll,
      });
      return jsonResponse(result, "✅ GitHub import initiated");
    } catch (error) {
      return this.handleError(this.name, error, "Failed to import from GitHub");
    }
  }
}

export const importFromGithubTool = new ImportFromGithubTool();
