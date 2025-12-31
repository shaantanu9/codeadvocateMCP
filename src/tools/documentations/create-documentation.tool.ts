/**
 * Create Documentation Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface CreateDocumentationParams {
  title: string;
  type?: string;
  category?: string;
  content: string;
  metadata?: Record<string, unknown>;
}

class CreateDocumentationTool extends BaseToolHandler implements BaseToolDefinition<CreateDocumentationParams> {
  name = "createDocumentation";
  description = "Create a new documentation";
  
  paramsSchema = z.object({
    title: z.string().describe("Title of the documentation"),
    type: z.string().optional().describe("Type of documentation (e.g., service, guide)"),
    category: z.string().optional().describe("Category (e.g., backend, frontend)"),
    content: z.string().describe("Content of the documentation"),
    metadata: z.record(z.unknown()).optional().describe("Additional metadata"),
  });

  async execute(params: CreateDocumentationParams): Promise<FormattedResponse> {
    this.logStart(this.name, { title: params.title });

    try {
      const apiService = this.getApiService();
      const body: Record<string, unknown> = {
        title: params.title,
        content: params.content,
      };
      if (params.type) body.type = params.type;
      if (params.category) body.category = params.category;
      if (params.metadata) body.metadata = params.metadata;

      const result = await apiService.post("/api/documentations", body);
      return jsonResponse(result, `✅ Created documentation: ${params.title}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to create documentation");
    }
  }
}

export const createDocumentationTool = new CreateDocumentationTool();




