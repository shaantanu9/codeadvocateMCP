/**
 * Update Repository Mermaid Diagram Tool
 * 
 * Update an existing Mermaid diagram.
 */

import { z } from "zod";
import { BaseToolHandler } from "../../base/tool-handler.base.js";
import { jsonResponse } from "../../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../../base/base-tool.interface.js";
import type { FormattedResponse } from "../../../utils/response-formatter.js";

export interface UpdateRepositoryMermaidParams {
  repositoryId: string;
  diagramId: string;
  title?: string;
  content?: string;
  description?: string;
  category?: string;
  explanation?: string;
  tags?: string[];
  fileName?: string;
}

class UpdateRepositoryMermaidTool
  extends BaseToolHandler
  implements BaseToolDefinition<UpdateRepositoryMermaidParams>
{
  name = "updateRepositoryMermaid";
  description = "Update an existing Mermaid diagram (all fields are optional - only include fields you want to update). The explanation field supports Markdown formatting and will be displayed below the diagram in the UI.";

  paramsSchema = z.object({
    repositoryId: z.string().describe("The ID of the repository"),
    diagramId: z.string().describe("The ID of the Mermaid diagram to update"),
    title: z.string().optional().describe("Diagram title"),
    content: z.string().optional().describe("Mermaid diagram code"),
    description: z.string().optional().describe("Diagram description"),
    category: z.string().optional().describe("Category (architecture, workflow, database, custom, etc.)"),
    explanation: z
      .string()
      .optional()
      .describe(
        "Markdown-formatted explanation of what the diagram represents. Supports full Markdown (headers, lists, code blocks, links, etc.). This will be displayed below the diagram in the UI and is searchable in the list endpoint."
      ),
    tags: z.array(z.string()).optional().describe("Array of tags"),
    fileName: z.string().optional().describe("Custom file name"),
  });

  async execute(params: UpdateRepositoryMermaidParams): Promise<FormattedResponse> {
    const { startTime } = this.logStart(this.name, params as unknown as Record<string, unknown>);

    try {
      const apiService = this.getApiService();
      const body: Record<string, unknown> = {};

      if (params.title) body.title = params.title;
      if (params.content) body.content = params.content;
      if (params.description) body.description = params.description;
      if (params.category) body.category = params.category;
      if (params.explanation) body.explanation = params.explanation;
      if (params.tags && params.tags.length > 0) body.tags = params.tags;
      if (params.fileName) body.file_name = params.fileName;

      const result = await apiService.put(
        `/api/repositories/${params.repositoryId}/mermaid/${params.diagramId}`,
        body
      );

      this.logSuccess(this.name, params as unknown as Record<string, unknown>, startTime, {
        success: true,
        message: `Updated Mermaid diagram: ${params.diagramId}`,
      });

      return jsonResponse(
        result,
        `✅ Updated Mermaid diagram: ${params.diagramId}`
      );
    } catch (error) {
      return this.handleError(
        this.name,
        error,
        "Failed to update repository Mermaid diagram",
        params as unknown as Record<string, unknown>,
        startTime
      );
    }
  }
}

export const updateRepositoryMermaidTool = new UpdateRepositoryMermaidTool();
