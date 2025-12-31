/**
 * Update Collection Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface UpdateCollectionParams {
  collectionId: string;
  name?: string;
  description?: string;
}

class UpdateCollectionTool extends BaseToolHandler implements BaseToolDefinition<UpdateCollectionParams> {
  name = "updateCollection";
  description = "Update an existing collection";
  
  paramsSchema = z.object({
    collectionId: z.string().describe("The ID of the collection to update"),
    name: z.string().optional().describe("Name of the collection"),
    description: z.string().optional().describe("Description of the collection"),
  });

  async execute(params: UpdateCollectionParams): Promise<FormattedResponse> {
    this.logStart(this.name, { collectionId: params.collectionId });

    try {
      const apiService = this.getApiService();
      const body: Record<string, unknown> = {};
      if (params.name) body.name = params.name;
      if (params.description) body.description = params.description;

      const result = await apiService.put(`/api/collections/${params.collectionId}`, body);
      return jsonResponse(result, `✅ Updated collection: ${params.collectionId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to update collection");
    }
  }
}

export const updateCollectionTool = new UpdateCollectionTool();




