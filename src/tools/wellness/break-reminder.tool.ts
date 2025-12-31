/**
 * Break Reminder Tool
 * 
 * Provides break reminders, water reminders, and wellness notifications
 * based on user activity and time spent working.
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import { getContext } from "../../core/context.js";
import { activityTracker } from "../../core/activity-tracker.js";
import { logger } from "../../core/logger.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";

/**
 * Break reminder tool handler
 */
class BreakReminderHandler extends BaseToolHandler {
  protected toolName = "breakReminder";

  async execute(_params: Record<string, never>): Promise<ReturnType<typeof jsonResponse>> {
    this.logStart("breakReminder", {});

    try {
      const context = getContext();
      
      if (!context || !context.sessionId) {
        return jsonResponse({
          success: false,
          error: {
            code: "NO_SESSION",
            message: "No active session found",
          },
        });
      }

      // Record activity
      activityTracker.recordActivity(context.sessionId);

      // Get break status
      const breakStatus = activityTracker.getBreakStatus(context.sessionId);

      // Format time strings
      const formatTime = (ms: number): string => {
        const minutes = Math.floor(ms / 60000);
        const hours = Math.floor(minutes / 60);
        if (hours > 0) {
          return `${hours}h ${minutes % 60}m`;
        }
        return `${minutes}m`;
      };

      return jsonResponse({
        success: true,
        data: {
          breakStatus: {
            shouldTakeBreak: breakStatus.shouldTakeBreak,
            forcedBreak: breakStatus.forcedBreak,
            breakType: breakStatus.breakType,
            message: breakStatus.message,
            timeUntilBreak: breakStatus.timeUntilBreak,
            timeUntilBreakFormatted: formatTime(breakStatus.timeUntilBreak),
            timeSinceLastBreak: breakStatus.timeSinceLastBreak,
            timeSinceLastBreakFormatted: formatTime(breakStatus.timeSinceLastBreak),
            shouldDrinkWater: breakStatus.shouldDrinkWater,
            shouldTakeLongBreak: breakStatus.shouldTakeLongBreak,
          },
          recommendations: this.getRecommendations(breakStatus),
          sessionInfo: {
            sessionId: context.sessionId,
            client: context.client?.name || "Unknown",
            workspace: context.workspace?.workspacePath || "Unknown",
          },
        },
        metadata: {
          requestId: context.requestId,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      logger.error("Failed to get break status", error);
      return jsonResponse({
        success: false,
        error: {
          code: "BREAK_STATUS_ERROR",
          message: error instanceof Error ? error.message : "Error checking break status",
        },
      });
    }
  }

  private getRecommendations(breakStatus: ReturnType<typeof activityTracker.getBreakStatus>): string[] {
    const recommendations: string[] = [];

    if (breakStatus.forcedBreak) {
      recommendations.push("🛑 MANDATORY: Take a break immediately. The server will block operations until you rest.");
      recommendations.push("💡 Step away from your computer for at least 10 minutes");
      recommendations.push("💡 Stretch, walk around, or do some light exercise");
    } else if (breakStatus.shouldTakeLongBreak) {
      recommendations.push("⏰ You've been working for a long time. Take a 15-30 minute break");
      recommendations.push("💡 Consider having a meal or doing something completely different");
      recommendations.push("💡 Your productivity will improve after a proper rest");
    } else if (breakStatus.shouldTakeBreak) {
      recommendations.push("⏰ It's time for a break! Take 10 minutes to rest");
      recommendations.push("💡 Look away from your screen and focus on something 20 feet away");
      recommendations.push("💡 Do some light stretching or walk around");
    }

    if (breakStatus.shouldDrinkWater) {
      recommendations.push("💧 Stay hydrated! Drink a glass of water");
      recommendations.push("💡 Proper hydration improves focus and productivity");
    }

    if (recommendations.length === 0) {
      recommendations.push("✅ You're doing great! Keep up the good work");
      recommendations.push("💡 Remember to take breaks every 20-30 minutes");
      recommendations.push("💡 Stay hydrated throughout your work session");
    }

    return recommendations;
  }
}

/**
 * Record break tool handler
 */
class RecordBreakHandler extends BaseToolHandler {
  protected toolName = "recordBreak";

  async execute(params: { duration?: number }): Promise<ReturnType<typeof jsonResponse>> {
    this.logStart("recordBreak", params);

    try {
      const context = getContext();
      
      if (!context || !context.sessionId) {
        return jsonResponse({
          success: false,
          error: {
            code: "NO_SESSION",
            message: "No active session found",
          },
        });
      }

      // Record the break
      activityTracker.recordBreak(context.sessionId, params.duration);

      return jsonResponse({
        success: true,
        data: {
          message: "Break recorded successfully",
          breakDuration: params.duration || 10,
          sessionId: context.sessionId,
          timestamp: new Date().toISOString(),
        },
        metadata: {
          requestId: context.requestId,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      logger.error("Failed to record break", error);
      return jsonResponse({
        success: false,
        error: {
          code: "RECORD_BREAK_ERROR",
          message: error instanceof Error ? error.message : "Error recording break",
        },
      });
    }
  }
}

const breakReminderHandler = new BreakReminderHandler();
const recordBreakHandler = new RecordBreakHandler();

/**
 * Break reminder tool
 */
export const breakReminderTool: BaseToolDefinition<Record<string, never>> = {
  name: "breakReminder",
  description:
    "Get break reminders and wellness notifications based on your work session. Returns recommendations for breaks, water intake, and forced break status if you've been working too long without rest.",
  paramsSchema: z.object({}),
  execute: async (params: Record<string, never>) => await breakReminderHandler.execute(params),
};

/**
 * Record break tool
 */
export const recordBreakTool: BaseToolDefinition<{ duration?: number }> = {
  name: "recordBreak",
  description:
    "Record that you've taken a break. This resets the break timer and allows continued work. Optionally specify break duration in minutes.",
  paramsSchema: z.object({
    duration: z.number().int().min(1).max(120).optional().describe("Break duration in minutes (default: 10)"),
  }),
  execute: async (params: { duration?: number }) => await recordBreakHandler.execute(params),
};

