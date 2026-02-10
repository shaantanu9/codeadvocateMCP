/**
 * Create Personal File Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface CreateFileParams {
  name: string;
  content: string;
  fileType?: string;
  tags?: string[];
}

class CreateFileTool extends BaseToolHandler implements BaseToolDefinition<CreateFileParams> {
  name = "createPersonalFile";
  description = "Create a new file in your personal knowledge base. Use for storing code snippets, configs, templates, and other reference files.";

  paramsSchema = z.object({
    name: z.string().describe("The file name"),
    content: z.string().describe("The file content"),
    fileType: z.string().optional().describe("File type/extension (e.g., 'js', 'py', 'json')"),
    tags: z.array(z.string()).optional().describe("Tags for categorizing the file"),
  });

  async execute(params: CreateFileParams): Promise<FormattedResponse> {
    this.logStart(this.name, { name: params.name });

    try {
      const apiService = this.getApiService();
      const result = await apiService.post("/api/personal/files", {
        name: params.name,
        content: params.content,
        fileType: params.fileType,
        tags: params.tags,
      });
      return jsonResponse(result, `✅ File created: ${params.name}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to create file");
    }
  }
}

export const createFileTool = new CreateFileTool();
