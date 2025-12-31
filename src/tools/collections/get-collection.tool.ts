/**
 * Get Collection Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface GetCollectionParams {
  collectionId: string;
}

class GetCollectionTool extends BaseToolHandler implements BaseToolDefinition<GetCollectionParams> {
  name = "getCollection";
  description = "Get a specific collection by ID";
  
  paramsSchema = z.object({
    collectionId: z.string().describe("The ID of the collection to retrieve"),
  });

  async execute(params: GetCollectionParams): Promise<FormattedResponse> {
    this.logStart(this.name, { collectionId: params.collectionId });

    try {
      const apiService = this.getApiService();
      const result = await apiService.get(`/api/collections/${params.collectionId}`);
      return jsonResponse(result, `✅ Retrieved collection: ${params.collectionId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to get collection");
    }
  }
}

export const getCollectionTool = new GetCollectionTool();




