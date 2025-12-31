/**
 * List Collection Snippets Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface ListCollectionSnippetsParams {
  collectionId: string;
  page?: number;
  limit?: number;
}

class ListCollectionSnippetsTool extends BaseToolHandler implements BaseToolDefinition<ListCollectionSnippetsParams> {
  name = "listCollectionSnippets";
  description = "List snippets in a collection";
  
  paramsSchema = z.object({
    collectionId: z.string().describe("The ID of the collection"),
    page: z.number().optional().default(1).describe("Page number for pagination"),
    limit: z.number().optional().default(20).describe("Number of items per page"),
  });

  async execute(params: ListCollectionSnippetsParams): Promise<FormattedResponse> {
    this.logStart(this.name, { collectionId: params.collectionId });

    try {
      const apiService = this.getApiService();
      const queryParams: Record<string, number> = {};
      if (params.page) queryParams.page = params.page;
      if (params.limit) queryParams.limit = params.limit;

      const result = await apiService.get(`/api/collections/${params.collectionId}/snippets`, queryParams);
      return jsonResponse(result, `✅ Retrieved snippets for collection: ${params.collectionId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to list collection snippets");
    }
  }
}

export const listCollectionSnippetsTool = new ListCollectionSnippetsTool();




