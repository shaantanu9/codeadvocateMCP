/**
 * List Progress Checkpoints Tool
 *
 * Lists all available progress checkpoints for repository analysis
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";
import { repositoryCache } from "../../core/repository-cache.js";

export interface ListCheckpointsParams {
  projectPath?: string;
}

class ListCheckpointsTool
  extends BaseToolHandler
  implements BaseToolDefinition<ListCheckpointsParams>
{
  name = "listProgressCheckpoints";
  description =
    "List all available progress checkpoints for repository analysis. Use this to find checkpoint IDs for resuming analysis.";

  paramsSchema = z.object({
    projectPath: z
      .string()
      .optional()
      .describe("Filter checkpoints by project path (optional)"),
  });

  async execute(params: ListCheckpointsParams): Promise<FormattedResponse> {
    this.logStart(this.name, params as Record<string, unknown>);

    try {
      const checkpoints = repositoryCache.listProgressCheckpoints();

      // Filter by project path if provided
      const filteredCheckpoints = params.projectPath
        ? checkpoints.filter((cp) => cp.projectPath === params.projectPath)
        : checkpoints;

      if (filteredCheckpoints.length === 0) {
        return jsonResponse(
          {
            checkpoints: [],
            message: "No checkpoints found",
          },
          "No progress checkpoints found. Start a new analysis to create a checkpoint."
        );
      }

      return jsonResponse(
        {
          checkpoints: filteredCheckpoints.map((cp) => ({
            checkpointId: cp.checkpointId,
            projectPath: cp.projectPath,
            status: cp.status,
            currentStep: cp.currentStep,
            lastUpdated: cp.lastUpdated,
            age: `${Math.round(
              (Date.now() - new Date(cp.lastUpdated).getTime()) / 1000 / 60
            )} minutes ago`,
          })),
          total: filteredCheckpoints.length,
        },
        `Found ${filteredCheckpoints.length} checkpoint(s). Use 'resume: true' with 'checkpointId' to resume from a checkpoint.`
      );
    } catch (error) {
      return this.handleError(
        this.name,
        error,
        "Failed to list progress checkpoints"
      );
    }
  }
}

export const listCheckpointsTool = new ListCheckpointsTool();



