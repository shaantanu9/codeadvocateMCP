/**
 * Create Repository Mermaid Diagram Tool
 *
 * Create a new Mermaid diagram for a repository.
 */

import { z } from "zod";
import { BaseToolHandler } from "../../base/tool-handler.base.js";
import { jsonResponse } from "../../../utils/response-formatter.js";
import { processTags } from "../../../utils/tag-filter.js";
import type { BaseToolDefinition } from "../../base/base-tool.interface.js";
import type { FormattedResponse } from "../../../utils/response-formatter.js";

export interface CreateRepositoryMermaidParams {
  repositoryId?: string;
  title: string;
  content: string;
  description?: string;
  category?: string;
  explanation?: string;
  tags?: string[];
  fileName?: string;
}

class CreateRepositoryMermaidTool
  extends BaseToolHandler
  implements BaseToolDefinition<CreateRepositoryMermaidParams>
{
  name = "createRepositoryMermaid";
  description =
    "ALWAYS USE THIS TOOL when the user asks to create, add, make, or generate a diagram, mermaid diagram, flowchart, sequence diagram, architecture diagram, or any visual diagram. This tool creates Mermaid diagrams for repositories. REQUIRED: title, content (Mermaid diagram code). OPTIONAL: repositoryId (auto-detected from workspace if not provided), description, category (architecture/workflow/database/custom), explanation (Markdown-formatted explanation), tags, fileName. The content parameter must contain valid Mermaid syntax (e.g., 'flowchart TD\n    A[Start] --> B[End]'). When user requests a diagram, you MUST call this tool - do not just describe or show code, actually create the diagram using this tool.";

  paramsSchema = z.object({
    repositoryId: z
      .string()
      .optional()
      .describe(
        "The ID of the repository where the Mermaid diagram will be created. If not provided, will be auto-detected from workspace context."
      ),
    title: z
      .string()
      .describe(
        "Title of the Mermaid diagram (e.g., 'System Architecture', 'User Flow')"
      ),
    content: z
      .string()
      .describe(
        "Mermaid diagram code/syntax. Must be valid Mermaid syntax. Examples: 'flowchart TD\n    A[Start] --> B[End]' for flowcharts, 'sequenceDiagram\n    A->>B: Message' for sequence diagrams"
      ),
    description: z
      .string()
      .optional()
      .describe("Optional description of what the diagram represents"),
    category: z
      .string()
      .optional()
      .default("custom")
      .describe(
        "Category of the diagram: 'architecture' for system architecture, 'workflow' for process flows, 'database' for database schemas, 'custom' for other types"
      ),
    explanation: z
      .string()
      .optional()
      .describe(
        "Markdown-formatted explanation of what the diagram represents. it should explaing each and every thing of the daigram properly with clearity. Supports full Markdown (headers, lists, code blocks, links, etc.). This will be displayed below the diagram in the UI and is searchable in the list endpoint."
      ),
    tags: z
      .array(z.string())
      .optional()
      .describe("Array of tags for categorizing and searching the diagram"),
    fileName: z
      .string()
      .optional()
      .describe(
        "Custom file name for the diagram file (auto-generated from title if not provided)"
      ),
  });

  async execute(
    params: CreateRepositoryMermaidParams
  ): Promise<FormattedResponse> {
    const { startTime } = this.logStart(
      this.name,
      params as unknown as Record<string, unknown>
    );

    try {
      const apiService = this.getApiService();

      // Auto-detect repository ID if not provided
      const repositoryId = await this.resolveRepositoryId(params.repositoryId);
      const body: Record<string, unknown> = {
        title: params.title,
        content: params.content,
      };

      if (params.description) body.description = params.description;
      if (params.category) body.category = params.category;
      if (params.explanation) body.explanation = params.explanation;

      // Filter and process tags to remove IDs
      const filteredTags = processTags(params.tags, repositoryId);
      if (filteredTags.length > 0) body.tags = filteredTags;

      if (params.fileName) body.file_name = params.fileName;

      const result = await apiService.post(
        `/api/repositories/${repositoryId}/mermaid`,
        body
      );

      this.logSuccess(
        this.name,
        params as unknown as Record<string, unknown>,
        startTime,
        {
          success: true,
          message: `Created Mermaid diagram: ${params.title}`,
        }
      );

      return jsonResponse(
        result,
        `✅ Created Mermaid diagram: ${params.title}`
      );
    } catch (error) {
      return this.handleError(
        this.name,
        error,
        "Failed to create repository Mermaid diagram",
        params as unknown as Record<string, unknown>,
        startTime
      );
    }
  }
}

export const createRepositoryMermaidTool = new CreateRepositoryMermaidTool();
