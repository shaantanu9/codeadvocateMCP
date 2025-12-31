/**
 * Create Repository File Tool
 * 
 * Creates a new file in a repository.
 * Based on API: POST /api/repositories/{repositoryId}/files
 * 
 * Required fields: file_name, file_path, content
 * Optional fields: file_type, project_id, collection_id, encoding, metadata
 */

import { z } from "zod";
import { BaseToolHandler } from "../../base/tool-handler.base.js";
import { jsonResponse } from "../../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../../base/base-tool.interface.js";
import type { FormattedResponse } from "../../../utils/response-formatter.js";

export interface CreateRepositoryFileParams {
  repositoryId: string;
  file_name: string; // Required: Name of the file (e.g., "README.md")
  file_path: string; // Required: Full path to the file (e.g., "/docs/README.md")
  content: string; // Required: File content
  file_type?: "markdown" | "text" | "json" | "yaml" | "xml"; // Optional: Default "text"
  project_id?: string; // Optional: Associate file with a project
  collection_id?: string; // Optional: Associate file with a collection
  encoding?: string; // Optional: File encoding (default: "utf-8")
  metadata?: Record<string, unknown>; // Optional: Additional metadata as JSON object
}

class CreateRepositoryFileTool extends BaseToolHandler implements BaseToolDefinition<CreateRepositoryFileParams> {
  name = "createRepositoryFile";
  description = "Create a file for a repository. Required: file_name, file_path, content. Supports markdown, text, json, yaml, xml file types.";
  
  paramsSchema = z.object({
    repositoryId: z.string().describe("The ID of the repository"),
    file_name: z.string().describe("Name of the file (e.g., 'README.md', 'config.json')"),
    file_path: z.string().describe("Full path to the file (e.g., '/docs/README.md', '/config/config.json')"),
    content: z.string().describe("Content of the file"),
    file_type: z.enum(["markdown", "text", "json", "yaml", "xml"]).optional().describe("Type of file. Options: markdown, text, json, yaml, xml. Default: text"),
    project_id: z.string().optional().describe("Optional: Associate file with a project"),
    collection_id: z.string().optional().describe("Optional: Associate file with a collection"),
    encoding: z.string().optional().describe("File encoding (default: utf-8)"),
    metadata: z.record(z.unknown()).optional().describe("Additional metadata as JSON object (e.g., {description: '...', version: '1.0.0'})"),
  });

  async execute(params: CreateRepositoryFileParams): Promise<FormattedResponse> {
    const { startTime } = this.logStart(this.name, { ...params } as Record<string, unknown>);

    try {
      const apiService = this.getApiService();
      
      // Build request body according to API specification
      const body: Record<string, unknown> = {
        file_name: params.file_name,
        file_path: params.file_path,
        content: params.content,
      };
      
      // Add optional fields
      if (params.file_type) {
        body.file_type = params.file_type;
      }
      if (params.project_id) {
        body.project_id = params.project_id;
      }
      if (params.collection_id) {
        body.collection_id = params.collection_id;
      }
      if (params.encoding) {
        body.encoding = params.encoding;
      }
      if (params.metadata) {
        body.metadata = params.metadata;
      }

      const result = await apiService.post(`/api/repositories/${params.repositoryId}/files`, body);
      
      this.logSuccess(this.name, { ...params } as Record<string, unknown>, startTime, {
        success: true,
        message: `Created file '${params.file_name}' at '${params.file_path}'`,
      });
      
      return jsonResponse(result, `✅ Created file '${params.file_name}' at '${params.file_path}' for repository: ${params.repositoryId}`);
    } catch (error) {
      return this.handleError(this.name, error, "Failed to create repository file", { ...params } as Record<string, unknown>, startTime);
    }
  }
}

export const createRepositoryFileTool = new CreateRepositoryFileTool();

