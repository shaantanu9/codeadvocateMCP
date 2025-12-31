/**
 * Delete Collection Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface DeleteCollectionParams {
  collectionId: string;
}

class DeleteCollectionTool extends BaseToolHandler implements BaseToolDefinition<DeleteCollectionParams> {
  name = "deleteCollection";
  description = "Delete a collection";
  
  paramsSchema = z.object({
    collectionId: z.string().describe("The ID of the collection to delete"),
  });

  async execute(params: DeleteCollectionParams): Promise<FormattedResponse> {
    this.logStart(this.name, { collectionId: params.collectionId });

    try {
      const apiService = this.getApiService();
      const result = await apiService.delete(`/api/collections/${params.collectionId}`);
      return jsonResponse(result, `✅ Deleted collection: ${params.collectionId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to delete collection");
    }
  }
}

export const deleteCollectionTool = new DeleteCollectionTool();




