/**
 * Remove Snippet from Collection Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface RemoveSnippetFromCollectionParams {
  collectionId: string;
  snippetId: string;
}

class RemoveSnippetFromCollectionTool extends BaseToolHandler implements BaseToolDefinition<RemoveSnippetFromCollectionParams> {
  name = "removeSnippetFromCollection";
  description = "Remove a snippet from a collection";
  
  paramsSchema = z.object({
    collectionId: z.string().describe("The ID of the collection"),
    snippetId: z.string().describe("The ID of the snippet to remove"),
  });

  async execute(params: RemoveSnippetFromCollectionParams): Promise<FormattedResponse> {
    this.logStart(this.name, { collectionId: params.collectionId, snippetId: params.snippetId });

    try {
      const apiService = this.getApiService();
      const result = await apiService.delete(`/api/collections/${params.collectionId}/snippets/${params.snippetId}`);
      return jsonResponse(result, `✅ Removed snippet ${params.snippetId} from collection ${params.collectionId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to remove snippet from collection");
    }
  }
}

export const removeSnippetFromCollectionTool = new RemoveSnippetFromCollectionTool();




