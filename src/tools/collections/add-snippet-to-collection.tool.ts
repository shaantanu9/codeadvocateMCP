/**
 * Add Snippet to Collection Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface AddSnippetToCollectionParams {
  collectionId: string;
  snippetId: string;
}

class AddSnippetToCollectionTool extends BaseToolHandler implements BaseToolDefinition<AddSnippetToCollectionParams> {
  name = "addSnippetToCollection";
  description = "Add a snippet to a collection";
  
  paramsSchema = z.object({
    collectionId: z.string().describe("The ID of the collection"),
    snippetId: z.string().describe("The ID of the snippet to add"),
  });

  async execute(params: AddSnippetToCollectionParams): Promise<FormattedResponse> {
    this.logStart(this.name, { collectionId: params.collectionId, snippetId: params.snippetId });

    try {
      const apiService = this.getApiService();
      // API expects snippetIds (array); send single id as one-element array for compatibility
      const result = await apiService.post(`/api/collections/${params.collectionId}/snippets`, {
        snippetIds: [params.snippetId],
      });
      return jsonResponse(result, `✅ Added snippet ${params.snippetId} to collection ${params.collectionId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to add snippet to collection");
    }
  }
}

export const addSnippetToCollectionTool = new AddSnippetToCollectionTool();




