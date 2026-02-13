/**
 * Repositories Tool (Consolidated)
 *
 * Manages repositories.
 * Actions: list, get, create, update
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

interface RepositoriesParams {
  action: "list" | "get" | "create" | "update";
  repositoryId?: string;
  name?: string;
  description?: string;
  type?: string;
  search?: string;
  page?: number;
  limit?: number;
  companyId?: string;
  isCompanyRepo?: boolean;
}

class RepositoriesTool
  extends BaseToolHandler
  implements BaseToolDefinition<RepositoriesParams>
{
  name = "repositories";
  description =
    "Manage repositories. Supports listing, getting details, creating, and updating repositories.";

  paramsSchema = z.object({
    action: z
      .enum(["list", "get", "create", "update"])
      .describe("The action to perform"),
    repositoryId: z.string().optional().describe("The repository ID (required for get, update)"),
    name: z.string().optional().describe("Repository name (required for create)"),
    description: z.string().optional().describe("Repository description"),
    type: z
      .enum(["all", "individual", "company"])
      .optional()
      .describe("Repository type filter for list (all|individual|company) or type for create/update (individual|company)"),
    search: z.string().optional().describe("Search query for filtering repositories"),
    page: z.number().optional().describe("Page number for pagination"),
    limit: z.number().optional().describe("Number of items per page"),
    companyId: z.string().optional().describe("Company ID for update"),
    isCompanyRepo: z.boolean().optional().describe("Whether this is a company repository (for update)"),
  });

  annotations = {
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: true,
  };

  async execute(params: RepositoriesParams): Promise<FormattedResponse> {
    const { startTime } = this.logStart(this.name, params as unknown as Record<string, unknown>);

    try {
      const apiService = this.getApiService();
      let result: unknown;

      switch (params.action) {
        case "list": {
          const query: Record<string, string | number | boolean> = {};
          if (params.type) query.type = params.type;
          if (params.search) query.search = params.search;
          if (params.page) query.page = params.page;
          if (params.limit) query.limit = params.limit;
          result = await apiService.get("/api/repositories", query);
          break;
        }

        case "get": {
          const repositoryId = this.requireParam(params.repositoryId, "repositoryId", "get");
          result = await apiService.get(`/api/repositories/${repositoryId}`);
          break;
        }

        case "create": {
          const name = this.requireParam(params.name, "name", "create");
          const body: Record<string, unknown> = { name };
          if (params.description) body.description = params.description;
          if (params.type) body.type = params.type;
          result = await apiService.post("/api/repositories", body);
          break;
        }

        case "update": {
          const repositoryId = this.requireParam(params.repositoryId, "repositoryId", "update");
          const body: Record<string, unknown> = {};
          if (params.name) body.name = params.name;
          if (params.description) body.description = params.description;
          if (params.type) body.type = params.type;
          if (params.companyId) body.company_id = params.companyId;
          if (params.isCompanyRepo !== undefined) body.is_company_repo = params.isCompanyRepo;
          result = await apiService.patch(`/api/repositories/${repositoryId}`, body);
          break;
        }
      }

      this.logSuccess(this.name, params as unknown as Record<string, unknown>, startTime, {
        success: true,
        message: `repositories.${params.action} completed`,
      });

      return jsonResponse(result, `repositories.${params.action} completed successfully`);
    } catch (error) {
      return this.handleError(
        this.name,
        error,
        `Failed to execute repositories.${params.action}`,
        params as unknown as Record<string, unknown>,
        startTime
      );
    }
  }
}

export const repositoriesTool = new RepositoriesTool();
