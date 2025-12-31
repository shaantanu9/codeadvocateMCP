/**
 * Update Repository File Tool
 * 
 * Update an existing file in a repository.
 * Based on API: PUT /api/repositories/{repositoryId}/files/{fileId}
 * 
 * All fields are optional. Only include fields you want to update.
 */

import { z } from "zod";
import { BaseToolHandler } from "../../base/tool-handler.base.js";
import { jsonResponse } from "../../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../../base/base-tool.interface.js";
import type { FormattedResponse } from "../../../utils/response-formatter.js";

export interface UpdateRepositoryFileParams {
  repositoryId: string;
  fileId: string;
  file_name?: string; // Optional: Update file name
  file_path?: string; // Optional: Update file path
  file_type?: "markdown" | "text" | "json" | "yaml" | "xml"; // Optional: Update file type
  content?: string; // Optional: Update file content
  project_id?: string | null; // Optional: Associate with project (null to remove)
  collection_id?: string | null; // Optional: Associate with collection (null to remove)
  metadata?: Record<string, unknown>; // Optional: Update metadata
}

class UpdateRepositoryFileTool extends BaseToolHandler implements BaseToolDefinition<UpdateRepositoryFileParams> {
  name = "updateRepositoryFile";
  description = "Update a file for a repository. All fields are optional - only include fields you want to update. Can update file_name, file_path, file_type, content, project_id, collection_id, or metadata.";
  
  paramsSchema = z.object({
    repositoryId: z.string().describe("The ID of the repository"),
    fileId: z.string().describe("The ID of the file to update"),
    file_name: z.string().optional().describe("Update file name"),
    file_path: z.string().optional().describe("Update file path"),
    file_type: z.enum(["markdown", "text", "json", "yaml", "xml"]).optional().describe("Update file type"),
    content: z.string().optional().describe("Update file content"),
    project_id: z.string().nullable().optional().describe("Associate file with a project (set to null to remove association)"),
    collection_id: z.string().nullable().optional().describe("Associate file with a collection (set to null to remove association)"),
    metadata: z.record(z.unknown()).optional().describe("Update metadata as JSON object"),
  });

  async execute(params: UpdateRepositoryFileParams): Promise<FormattedResponse> {
    const { startTime } = this.logStart(this.name, { ...params } as Record<string, unknown>);

    try {
      const apiService = this.getApiService();
      const body: Record<string, unknown> = {};
      
      // Add only provided fields (all optional)
      if (params.file_name !== undefined) body.file_name = params.file_name;
      if (params.file_path !== undefined) body.file_path = params.file_path;
      if (params.file_type !== undefined) body.file_type = params.file_type;
      if (params.content !== undefined) body.content = params.content;
      if (params.project_id !== undefined) body.project_id = params.project_id;
      if (params.collection_id !== undefined) body.collection_id = params.collection_id;
      if (params.metadata !== undefined) body.metadata = params.metadata;

      // Ensure at least one field is being updated
      if (Object.keys(body).length === 0) {
        return jsonResponse({
          success: false,
          error: {
            code: "NO_FIELDS",
            message: "At least one field must be provided for update",
          },
        });
      }

      const result = await apiService.put(`/api/repositories/${params.repositoryId}/files/${params.fileId}`, body);
      
      this.logSuccess(this.name, { ...params } as Record<string, unknown>, startTime, {
        success: true,
        message: `Updated file ${params.fileId} for repository: ${params.repositoryId}`,
      });
      
      return jsonResponse(result, `✅ Updated file ${params.fileId} for repository: ${params.repositoryId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to update repository file", { ...params } as Record<string, unknown>, startTime);
    }
  }
}

export const updateRepositoryFileTool = new UpdateRepositoryFileTool();

