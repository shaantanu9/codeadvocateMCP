/**
 * List Repository Files Tool
 * 
 * List all files in a repository with optional search and filters.
 * Based on API: GET /api/repositories/{repositoryId}/files
 * 
 * Query parameters: page, limit, search, file_type, project_id, collection_id
 */

import { z } from "zod";
import { BaseToolHandler } from "../../base/tool-handler.base.js";
import { jsonResponse } from "../../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../../base/base-tool.interface.js";
import type { FormattedResponse } from "../../../utils/response-formatter.js";

export interface ListRepositoryFilesParams {
  repositoryId: string;
  search?: string; // Search in file_name, file_path, and content
  file_type?: string; // Filter by file type (markdown, text, json, yaml, xml)
  project_id?: string; // Filter by project
  collection_id?: string; // Filter by collection
  page?: number; // Page number (default: 1)
  limit?: number; // Items per page (default: 50, max: 100)
}

class ListRepositoryFilesTool extends BaseToolHandler implements BaseToolDefinition<ListRepositoryFilesParams> {
  name = "listRepositoryFiles";
  description = "List files for a repository with optional search, filters, and pagination. Supports filtering by file type, project, and collection.";
  
  paramsSchema = z.object({
    repositoryId: z.string().describe("The ID of the repository"),
    search: z.string().optional().describe("Search term to filter files (searches in file_name, file_path, and content)"),
    file_type: z.string().optional().describe("Filter by file type (markdown, text, json, yaml, xml)"),
    project_id: z.string().optional().describe("Filter by project ID"),
    collection_id: z.string().optional().describe("Filter by collection ID"),
    page: z.number().int().min(1).optional().default(1).describe("Page number for pagination (default: 1)"),
    limit: z.number().int().min(1).max(100).optional().default(50).describe("Number of items per page (default: 50, max: 100)"),
  });

  async execute(params: ListRepositoryFilesParams): Promise<FormattedResponse> {
    const { startTime } = this.logStart(this.name, { ...params } as Record<string, unknown>);

    try {
      const apiService = this.getApiService();
      const queryParams: Record<string, string | number> = {};
      
      if (params.search) queryParams.search = params.search;
      if (params.file_type) queryParams.file_type = params.file_type;
      if (params.project_id) queryParams.project_id = params.project_id;
      if (params.collection_id) queryParams.collection_id = params.collection_id;
      if (params.page) queryParams.page = params.page;
      if (params.limit) queryParams.limit = params.limit;

      const result = await apiService.get(`/api/repositories/${params.repositoryId}/files`, queryParams);
      
      this.logSuccess(this.name, { ...params } as Record<string, unknown>, startTime, {
        success: true,
        message: `Retrieved files for repository: ${params.repositoryId}`,
      });
      
      return jsonResponse(result, `✅ Retrieved files for repository: ${params.repositoryId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to list repository files", { ...params } as Record<string, unknown>, startTime);
    }
  }
}

export const listRepositoryFilesTool = new ListRepositoryFilesTool();

