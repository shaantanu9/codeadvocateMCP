/**
 * Delete Personal File Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface DeleteFileParams {
  fileId: string;
}

class DeleteFileTool extends BaseToolHandler implements BaseToolDefinition<DeleteFileParams> {
  name = "deletePersonalFile";
  description = "Delete a file from your personal knowledge base.";

  paramsSchema = z.object({
    fileId: z.string().describe("The ID of the file to delete"),
  });

  async execute(params: DeleteFileParams): Promise<FormattedResponse> {
    this.logStart(this.name, { fileId: params.fileId });

    try {
      const apiService = this.getApiService();
      const result = await apiService.delete(`/api/personal/files/${params.fileId}`);
      return jsonResponse(result, `✅ File deleted: ${params.fileId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to delete file");
    }
  }
}

export const deleteFileTool = new DeleteFileTool();
