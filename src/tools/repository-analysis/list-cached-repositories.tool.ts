/**
 * List Cached Repositories Tool
 * 
 * Lists all repositories that have been analyzed and cached
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";
import { repositoryCache } from "../../core/repository-cache.js";

export interface ListCachedRepositoriesParams {
  // No parameters
}

class ListCachedRepositoriesTool extends BaseToolHandler implements BaseToolDefinition<ListCachedRepositoriesParams> {
  name = "listCachedRepositories";
  description = "List all repositories that have been analyzed and cached locally";
  
  paramsSchema = z.object({});

  async execute(_params: ListCachedRepositoriesParams): Promise<FormattedResponse> {
    this.logStart(this.name);

    try {
      const cached = repositoryCache.listAll();

      return jsonResponse(
        {
          count: cached.length,
          repositories: cached,
        },
        `✅ Found ${cached.length} cached repository analysis${cached.length === 1 ? "" : "es"}`
      );
    } catch (error) {
      return this.handleError(this.name, error, "Failed to list cached repositories");
    }
  }
}

export const listCachedRepositoriesTool = new ListCachedRepositoriesTool();




