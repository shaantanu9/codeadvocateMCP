/**
 * Consolidated Wellness Tool
 *
 * Combines break reminder and record break operations into a single tool with an action parameter.
 * Delegates to existing wellness tool implementations.
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";
import { breakReminderTool, recordBreakTool } from "../wellness/index.js";

const ACTIONS = ["breakReminder", "recordBreak"] as const;

type WellnessAction = (typeof ACTIONS)[number];

interface WellnessParams {
  action: WellnessAction;
  duration?: number;
}

class WellnessTool extends BaseToolHandler implements BaseToolDefinition<WellnessParams> {
  name = "wellness";

  description = `Wellness and break management. Use 'action' to specify operation:
- breakReminder: Get break reminders and wellness notifications based on your work session (no params)
- recordBreak: Record that you've taken a break, resets break timer (optional: duration in minutes, default 10)`;

  paramsSchema = z.object({
    action: z.enum(ACTIONS).describe("Operation to perform"),
    duration: z.number().int().min(1).max(120).optional().describe("Break duration in minutes (default: 10). Used by: recordBreak"),
  });

  annotations = {
    readOnlyHint: false,
    destructiveHint: false,
    idempotentHint: false,
    openWorldHint: false,
  };

  async execute(params: WellnessParams): Promise<FormattedResponse> {
    switch (params.action) {
      case "breakReminder": {
        const { startTime } = this.logStart(`${this.name}.breakReminder`, {});
        try {
          const result = await breakReminderTool.execute({} as Record<string, never>);
          this.logSuccess(`${this.name}.breakReminder`, {}, startTime);
          return result;
        } catch (error) {
          return this.handleError(`${this.name}.breakReminder`, error, "Failed to get break reminder", {}, startTime);
        }
      }
      case "recordBreak": {
        const { startTime } = this.logStart(`${this.name}.recordBreak`, { duration: params.duration });
        try {
          const result = await recordBreakTool.execute({ duration: params.duration });
          this.logSuccess(`${this.name}.recordBreak`, { duration: params.duration } as unknown as Record<string, unknown>, startTime);
          return result;
        } catch (error) {
          return this.handleError(`${this.name}.recordBreak`, error, "Failed to record break", { duration: params.duration } as unknown as Record<string, unknown>, startTime);
        }
      }
      default:
        return this.handleError(this.name, new Error(`Unknown action: ${params.action}`), `Unknown action`);
    }
  }
}

export const wellnessTool = new WellnessTool();
