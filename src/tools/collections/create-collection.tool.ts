/**
 * Create Collection Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface CreateCollectionParams {
  name: string;
  description?: string;
}

class CreateCollectionTool extends BaseToolHandler implements BaseToolDefinition<CreateCollectionParams> {
  name = "createCollection";
  description = "Create a new collection";
  
  paramsSchema = z.object({
    name: z.string().describe("Name of the collection"),
    description: z.string().optional().describe("Description of the collection"),
  });

  async execute(params: CreateCollectionParams): Promise<FormattedResponse> {
    this.logStart(this.name, { name: params.name });

    try {
      const apiService = this.getApiService();
      const body: Record<string, unknown> = { name: params.name };
      if (params.description) body.description = params.description;

      const result = await apiService.post("/api/collections", body);
      return jsonResponse(result, `✅ Created collection: ${params.name}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to create collection");
    }
  }
}

export const createCollectionTool = new CreateCollectionTool();




