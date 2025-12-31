/**
 * Wellness Scheduler
 * 
 * Automatically triggers wellness tools (break reminders) at regular intervals
 * for active sessions.
 */

import { logger } from "./logger.js";
import { activityTracker } from "./activity-tracker.js";
import { runInContext } from "./context.js";
import type { BaseToolDefinition } from "../tools/base/base-tool.interface.js";
import type { RequestContext } from "./types.js";

interface WellnessSchedulerConfig {
  /** Interval in milliseconds between wellness checks (default: 30 minutes) */
  checkInterval: number;
  /** Whether the scheduler is enabled (default: true) */
  enabled: boolean;
}

class WellnessScheduler {
  private intervalId: NodeJS.Timeout | null = null;
  private config: WellnessSchedulerConfig;
  private breakReminderTool: BaseToolDefinition | null = null;

  constructor(config?: Partial<WellnessSchedulerConfig>) {
    this.config = {
      checkInterval: config?.checkInterval ?? 30 * 60 * 1000, // 30 minutes default
      enabled: config?.enabled ?? true,
    };
  }

  /**
   * Set the break reminder tool to be called automatically
   */
  setBreakReminderTool(tool: BaseToolDefinition): void {
    this.breakReminderTool = tool;
    logger.info("Wellness scheduler: Break reminder tool registered");
  }

  /**
   * Start the wellness scheduler
   */
  start(): void {
    if (!this.config.enabled) {
      logger.info("Wellness scheduler: Disabled");
      return;
    }

    if (this.intervalId) {
      logger.warn("Wellness scheduler: Already running");
      return;
    }

    logger.info(
      `Wellness scheduler: Starting with ${this.config.checkInterval / 1000 / 60} minute intervals`
    );

    // Run immediately on start
    this.checkAndNotify();

    // Then run at intervals
    this.intervalId = setInterval(() => {
      this.checkAndNotify();
    }, this.config.checkInterval);
  }

  /**
   * Stop the wellness scheduler
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      logger.info("Wellness scheduler: Stopped");
    }
  }

  /**
   * Check all active sessions and trigger break reminders if needed
   */
  private async checkAndNotify(): Promise<void> {
    try {
      // Get all active sessions from activity tracker
      const activeSessionIds = activityTracker.getActiveSessionIds();
      
      if (activeSessionIds.length === 0) {
        logger.debug("Wellness scheduler: No active sessions");
        return;
      }

      logger.debug(`Wellness scheduler: Checking ${activeSessionIds.length} active session(s)`);

      for (const sessionId of activeSessionIds) {
        try {
          // Check break status for this session
          const breakStatus = activityTracker.getBreakStatus(sessionId);

          // If break is needed, trigger the reminder
          if (breakStatus.shouldTakeBreak || breakStatus.forcedBreak) {
            await this.triggerBreakReminder(sessionId, breakStatus);
          }
        } catch (error) {
          logger.error(`Wellness scheduler: Error checking session ${sessionId}`, error);
        }
      }
    } catch (error) {
      logger.error("Wellness scheduler: Error during check", error);
    }
  }

  /**
   * Trigger break reminder for a specific session
   */
  private async triggerBreakReminder(
    sessionId: string,
    breakStatus: ReturnType<typeof activityTracker.getBreakStatus>
  ): Promise<void> {
    if (!this.breakReminderTool) {
      logger.warn("Wellness scheduler: Break reminder tool not registered");
      return;
    }

    try {
      logger.info(`Wellness scheduler: Triggering break reminder for session ${sessionId}`);

      // Create a temporary context for this session
      // The tool needs context to access sessionId, so we create a minimal context
      const schedulerContext: RequestContext = {
        sessionId,
        requestId: `wellness-scheduler-${Date.now()}`,
        timestamp: Date.now(),
        ip: "scheduler",
        token: "", // Empty token for scheduler (not used for authentication)
      };

      // Execute the break reminder tool within the context
      await runInContext(schedulerContext, async () => {
        await this.breakReminderTool!.execute({});
      });
      
      logger.info(`Wellness scheduler: Break reminder triggered for session ${sessionId}`, {
        shouldTakeBreak: breakStatus.shouldTakeBreak,
        forcedBreak: breakStatus.forcedBreak,
        breakType: breakStatus.breakType,
      });

      // Log the reminder (could also send notifications here)
      if (breakStatus.forcedBreak) {
        logger.warn(
          `Wellness scheduler: FORCED BREAK needed for session ${sessionId} - ${breakStatus.message}`
        );
      } else {
        logger.info(
          `Wellness scheduler: Break reminder for session ${sessionId} - ${breakStatus.message}`
        );
      }
    } catch (error) {
      logger.error(
        `Wellness scheduler: Error triggering break reminder for session ${sessionId}`,
        error
      );
    }
  }

  /**
   * Update scheduler configuration
   */
  updateConfig(config: Partial<WellnessSchedulerConfig>): void {
    const wasRunning = this.intervalId !== null;

    if (wasRunning) {
      this.stop();
    }

    this.config = { ...this.config, ...config };

    if (wasRunning && this.config.enabled) {
      this.start();
    }

    logger.info("Wellness scheduler: Configuration updated", this.config);
  }

  /**
   * Get current scheduler status
   */
  getStatus(): {
    running: boolean;
    enabled: boolean;
    checkInterval: number;
    nextCheck?: Date;
  } {
    return {
      running: this.intervalId !== null,
      enabled: this.config.enabled,
      checkInterval: this.config.checkInterval,
    };
  }
}

// Export singleton instance
export const wellnessScheduler = new WellnessScheduler({
  checkInterval: process.env.WELLNESS_CHECK_INTERVAL
    ? parseInt(process.env.WELLNESS_CHECK_INTERVAL, 10) * 60 * 1000 // Convert minutes to ms
    : 30 * 60 * 1000, // Default: 30 minutes
  enabled: process.env.WELLNESS_SCHEDULER_ENABLED !== "false", // Default: true
});
