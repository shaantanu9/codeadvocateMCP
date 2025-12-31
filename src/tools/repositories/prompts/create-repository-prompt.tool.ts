/**
 * Create Repository Prompt Tool
 */

import { z } from "zod";
import { BaseToolHandler } from "../../base/tool-handler.base.js";
import { jsonResponse } from "../../../utils/response-formatter.js";
import { logger } from "../../../core/logger.js";
import type { BaseToolDefinition } from "../../base/base-tool.interface.js";
import type { FormattedResponse } from "../../../utils/response-formatter.js";

export interface CreateRepositoryPromptParams {
  repositoryId: string;
  title: string;
  promptContent: string;
  promptType?: string;
  category?: string;
}

/**
 * Map user-friendly prompt type to API enum value
 */
function mapPromptType(userType: string | undefined): string {
  if (!userType) return "other";

  const mapping: Record<string, string> = {
    development: "code_generation",
    review: "code_review",
    documentation: "documentation",
    refactor: "refactoring",
    test: "testing",
    debug: "debugging",
    explain: "explanation",
    // Direct API values pass through
    code_generation: "code_generation",
    code_review: "code_review",
    refactoring: "refactoring",
    testing: "testing",
    debugging: "debugging",
    explanation: "explanation",
  };

  return mapping[userType.toLowerCase()] || "other";
}

class CreateRepositoryPromptTool
  extends BaseToolHandler
  implements BaseToolDefinition<CreateRepositoryPromptParams>
{
  name = "createRepositoryPrompt";
  description = "Create a prompt for a repository";

  paramsSchema = z.object({
    repositoryId: z.string().describe("The ID of the repository"),
    title: z.string().describe("Title of the prompt"),
    promptContent: z.string().describe("Content of the prompt"),
    promptType: z
      .enum([
        "code_generation",
        "code_review",
        "documentation",
        "refactoring",
        "testing",
        "debugging",
        "explanation",
        "other",
        "development",
        "review",
        "refactor",
        "test",
        "debug",
        "explain",
      ])
      .optional()
      .describe(
        "Type of prompt. Allowed values: code_generation, code_review, documentation, refactoring, testing, debugging, explanation, other. User-friendly values: development (maps to code_generation), review (maps to code_review), refactor (maps to refactoring), test (maps to testing), debug (maps to debugging), explain (maps to explanation)"
      ),
    category: z
      .string()
      .optional()
      .describe("Category (optional, can be any string value)"),
  });

  async execute(
    params: CreateRepositoryPromptParams
  ): Promise<FormattedResponse> {
    const { startTime } = this.logStart(this.name, { ...params } as Record<
      string,
      unknown
    >);

    try {
      const apiService = this.getApiService();
      const body: Record<string, unknown> = {
        title: params.title,
        prompt_text: params.promptContent, // API expects prompt_text, not prompt_content
      };

      // Map user-friendly prompt type to API enum value
      const mappedPromptType = mapPromptType(params.promptType);
      if (mappedPromptType !== "other" || params.promptType) {
        body.prompt_type = mappedPromptType;
      }

      if (params.category) body.category = params.category;

      // Log request details for debugging
      logger.debug(`[${this.name}] Preparing API request`, {
        endpoint: `/api/repositories/${params.repositoryId}/prompts`,
        method: "POST",
        body: {
          title: body.title,
          prompt_text_length:
            typeof body.prompt_text === "string" ? body.prompt_text.length : 0,
          prompt_type: body.prompt_type || "not provided",
          category: body.category || "not provided",
        },
        repositoryId: params.repositoryId,
        note: "Using 'prompt_text' field (API requirement)",
      });

      const result = await apiService.post(
        `/api/repositories/${params.repositoryId}/prompts`,
        body
      );

      this.logSuccess(
        this.name,
        { ...params } as Record<string, unknown>,
        startTime,
        {
          success: true,
          message: `Created prompt for repository: ${params.repositoryId}`,
        }
      );

      return jsonResponse(
        result,
        `✅ Created prompt for repository: ${params.repositoryId}`
      );
    } catch (error) {
      // Enhanced error logging with field validation hints
      if (error instanceof Error && error.message.includes("prompt_text")) {
        logger.warn(`[${this.name}] Field validation error`, {
          error: error.message,
          note: "API requires 'prompt_text' field (not 'prompt_content')",
          repositoryId: params.repositoryId,
          title: params.title,
          hasPromptContent: !!params.promptContent,
        });
      }

      return this.handleError(
        this.name,
        error,
        "Failed to create repository prompt",
        { ...params } as Record<string, unknown>,
        startTime
      );
    }
  }
}

export const createRepositoryPromptTool = new CreateRepositoryPromptTool();
