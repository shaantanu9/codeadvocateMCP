/**
 * Activity Tracker
 *
 * Tracks user activity, session duration, and enforces break reminders.
 * Monitors continuous usage and triggers break notifications.
 */

import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  readdirSync,
} from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { logger } from "./logger.js";
import type { ClientInfo } from "./client-detector.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Activity session data
 */
export interface ActivitySession {
  sessionId: string;
  startTime: number;
  lastActivityTime: number;
  totalActiveTime: number; // in milliseconds
  breakCount: number;
  lastBreakTime?: number;
  clientInfo?: ClientInfo;
  workspacePath?: string;
  requestCount: number;
  forcedBreakRequired: boolean;
  metadata: {
    createdAt: number;
    lastUpdated: number;
  };
}

/**
 * Break reminder configuration
 */
export interface BreakConfig {
  /** Time in milliseconds before suggesting a break (default: 20 minutes) */
  breakInterval: number;
  /** Time in milliseconds before forcing a break (default: 30 minutes) */
  forcedBreakInterval: number;
  /** Time in milliseconds for water reminder (default: 1 hour) */
  waterReminderInterval: number;
  /** Time in milliseconds for long break after continuous work (default: 3 hours) */
  longBreakInterval: number;
  /** Break duration in milliseconds (default: 10 minutes) */
  breakDuration: number;
}

const DEFAULT_BREAK_CONFIG: BreakConfig = {
  breakInterval: 20 * 60 * 1000, // 20 minutes
  forcedBreakInterval: 30 * 60 * 1000, // 30 minutes
  waterReminderInterval: 60 * 60 * 1000, // 1 hour
  longBreakInterval: 3 * 60 * 60 * 1000, // 3 hours
  breakDuration: 10 * 60 * 1000, // 10 minutes
};

/**
 * Activity statistics
 */
export interface ActivityStats {
  sessionId: string;
  totalActiveTime: number;
  totalSessions: number;
  averageSessionDuration: number;
  breakCount: number;
  lastBreakTime?: number;
  lastActivityTime: number;
  clientInfo?: ClientInfo;
  workspacePath?: string;
}

/**
 * Break reminder status
 */
export interface BreakStatus {
  shouldTakeBreak: boolean;
  forcedBreak: boolean;
  timeUntilBreak: number; // milliseconds
  timeSinceLastBreak: number; // milliseconds
  timeSinceLastWater: number; // milliseconds
  shouldDrinkWater: boolean;
  shouldTakeLongBreak: boolean;
  message: string;
  breakType: "short" | "long" | "water" | "none";
}

/**
 * Activity Tracker class
 */
export class ActivityTracker {
  private sessions = new Map<string, ActivitySession>();
  private activityDir: string;
  private config: BreakConfig;

  constructor(config?: Partial<BreakConfig>) {
    this.config = { ...DEFAULT_BREAK_CONFIG, ...config };

    // Create activity storage directory
    const baseDir = join(__dirname, "..", "..", ".mcp-activity");
    this.activityDir = join(baseDir, "sessions");

    if (!existsSync(this.activityDir)) {
      mkdirSync(this.activityDir, { recursive: true });
    }

    // Cleanup old sessions periodically
    setInterval(() => this.cleanupOldSessions(), 5 * 60 * 1000); // Every 5 minutes
  }

  /**
   * Start or update an activity session
   */
  startSession(
    sessionId: string,
    clientInfo?: ClientInfo,
    workspacePath?: string
  ): ActivitySession {
    const now = Date.now();
    let session = this.sessions.get(sessionId);

    if (!session) {
      // Create new session
      session = {
        sessionId,
        startTime: now,
        lastActivityTime: now,
        totalActiveTime: 0,
        breakCount: 0,
        requestCount: 0,
        forcedBreakRequired: false,
        clientInfo,
        workspacePath,
        metadata: {
          createdAt: now,
          lastUpdated: now,
        },
      };
      this.sessions.set(sessionId, session);
      this.saveSessionToDisk(session);
      logger.info("Activity session started", {
        sessionId,
        clientInfo,
        workspacePath,
      });
    } else {
      // Update existing session
      const timeSinceLastActivity = now - session.lastActivityTime;

      // Only add to active time if activity was recent (within 5 minutes)
      if (timeSinceLastActivity < 5 * 60 * 1000) {
        session.totalActiveTime += timeSinceLastActivity;
      }

      session.lastActivityTime = now;
      session.requestCount++;
      session.metadata.lastUpdated = now;

      // Update client info if provided
      if (clientInfo) {
        session.clientInfo = clientInfo;
      }
      if (workspacePath) {
        session.workspacePath = workspacePath;
      }

      this.saveSessionToDisk(session);
    }

    return session;
  }

  /**
   * Record activity (request/action)
   */
  recordActivity(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return;
    }

    const now = Date.now();
    const timeSinceLastActivity = now - session.lastActivityTime;

    // Add time to active time if recent activity
    if (timeSinceLastActivity < 5 * 60 * 1000) {
      session.totalActiveTime += timeSinceLastActivity;
    }

    session.lastActivityTime = now;
    session.requestCount++;
    session.metadata.lastUpdated = now;

    this.saveSessionToDisk(session);
  }

  /**
   * Check break status for a session
   */
  getBreakStatus(sessionId: string): BreakStatus {
    const session = this.sessions.get(sessionId);
    const now = Date.now();

    if (!session) {
      return {
        shouldTakeBreak: false,
        forcedBreak: false,
        timeUntilBreak: 0,
        timeSinceLastBreak: 0,
        timeSinceLastWater: 0,
        shouldDrinkWater: false,
        shouldTakeLongBreak: false,
        message: "No active session",
        breakType: "none",
      };
    }

    const timeSinceLastActivity = now - session.lastActivityTime;
    const timeSinceLastBreak = session.lastBreakTime
      ? now - session.lastBreakTime
      : session.totalActiveTime;
    const timeSinceStart = now - session.startTime;

    // Check for forced break (30 minutes of continuous activity)
    const forcedBreak =
      timeSinceLastActivity >= this.config.forcedBreakInterval;

    // Check for regular break (20 minutes)
    const shouldTakeBreak = timeSinceLastActivity >= this.config.breakInterval;

    // Check for water reminder (1 hour)
    const shouldDrinkWater =
      timeSinceLastActivity >= this.config.waterReminderInterval;

    // Check for long break (3 hours total)
    const shouldTakeLongBreak = timeSinceStart >= this.config.longBreakInterval;

    let message = "";
    let breakType: "short" | "long" | "water" | "none" = "none";

    if (forcedBreak) {
      message = `⚠️ FORCED BREAK REQUIRED: You've been working for ${Math.round(
        timeSinceLastActivity / 60000
      )} minutes. Please take a ${Math.round(
        this.config.breakDuration / 60000
      )}-minute break now. The MCP server will be unavailable until you take a break.`;
      breakType = "long";
    } else if (shouldTakeLongBreak) {
      message = `🛑 LONG BREAK NEEDED: You've been working for ${Math.round(
        timeSinceStart / 3600000
      )} hours. Please take a longer break (15-30 minutes).`;
      breakType = "long";
    } else if (shouldTakeBreak) {
      message = `⏰ BREAK REMINDER: You've been active for ${Math.round(
        timeSinceLastActivity / 60000
      )} minutes. Consider taking a ${Math.round(
        this.config.breakDuration / 60000
      )}-minute break.`;
      breakType = "short";
    } else if (shouldDrinkWater) {
      message = `💧 WATER REMINDER: It's been ${Math.round(
        timeSinceLastActivity / 60000
      )} minutes. Stay hydrated! Drink some water.`;
      breakType = "water";
    }

    return {
      shouldTakeBreak,
      forcedBreak,
      timeUntilBreak: Math.max(
        0,
        this.config.breakInterval - timeSinceLastActivity
      ),
      timeSinceLastBreak,
      timeSinceLastWater: timeSinceLastActivity,
      shouldDrinkWater,
      shouldTakeLongBreak,
      message,
      breakType,
    };
  }

  /**
   * Record that user took a break
   */
  recordBreak(sessionId: string, breakDuration?: number): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return;
    }

    const now = Date.now();
    session.lastBreakTime = now;
    session.breakCount++;
    session.forcedBreakRequired = false;
    session.lastActivityTime = now; // Reset activity timer
    session.metadata.lastUpdated = now;

    this.saveSessionToDisk(session);
    logger.info("Break recorded", {
      sessionId,
      breakCount: session.breakCount,
      breakDuration: breakDuration || this.config.breakDuration,
    });
  }

  /**
   * Get activity statistics for a session
   */
  getActivityStats(sessionId: string): ActivityStats | null {
    const session = this.sessions.get(sessionId);
    if (!session) {
      // Try to load from disk
      const diskSession = this.loadSessionFromDisk(sessionId);
      if (!diskSession) {
        return null;
      }
      return this.sessionToStats(diskSession);
    }

    return this.sessionToStats(session);
  }

  /**
   * Get all activity statistics
   */
  getAllActivityStats(): ActivityStats[] {
    const stats: ActivityStats[] = [];

    // Get from memory
    for (const session of this.sessions.values()) {
      stats.push(this.sessionToStats(session));
    }

    // Get from disk (sessions not in memory)
    try {
      const files = readdirSync(this.activityDir);
      for (const file of files) {
        if (file.endsWith(".json")) {
          const sessionId = file.replace(".json", "");
          if (!this.sessions.has(sessionId)) {
            const session = this.loadSessionFromDisk(sessionId);
            if (session) {
              stats.push(this.sessionToStats(session));
            }
          }
        }
      }
    } catch (error) {
      logger.error("Error reading activity files", error);
    }

    return stats;
  }

  /**
   * Convert session to stats
   */
  private sessionToStats(session: ActivitySession): ActivityStats {
    return {
      sessionId: session.sessionId,
      totalActiveTime: session.totalActiveTime,
      totalSessions: 1,
      averageSessionDuration: session.totalActiveTime,
      breakCount: session.breakCount,
      lastBreakTime: session.lastBreakTime,
      lastActivityTime: session.lastActivityTime,
      clientInfo: session.clientInfo,
      workspacePath: session.workspacePath,
    };
  }

  /**
   * Save session to disk
   */
  private saveSessionToDisk(session: ActivitySession): void {
    try {
      const filePath = join(this.activityDir, `${session.sessionId}.json`);
      writeFileSync(filePath, JSON.stringify(session, null, 2));
    } catch (error) {
      logger.error("Error saving activity session to disk", error);
    }
  }

  /**
   * Load session from disk
   */
  private loadSessionFromDisk(sessionId: string): ActivitySession | null {
    try {
      const filePath = join(this.activityDir, `${sessionId}.json`);
      if (existsSync(filePath)) {
        const data = readFileSync(filePath, "utf-8");
        return JSON.parse(data) as ActivitySession;
      }
    } catch (error) {
      logger.error("Error loading activity session from disk", error);
    }
    return null;
  }

  /**
   * Get all active session IDs (sessions with recent activity)
   */
  getActiveSessionIds(): string[] {
    const now = Date.now();
    const activeSessionIds: string[] = [];
    
    for (const [sessionId, session] of this.sessions.entries()) {
      // Consider session active if it has activity in the last 30 minutes
      const timeSinceLastActivity = now - session.lastActivityTime;
      if (timeSinceLastActivity < 30 * 60 * 1000) {
        activeSessionIds.push(sessionId);
      }
    }
    
    return activeSessionIds;
  }

  /**
   * Cleanup old sessions (older than 24 hours)
   */
  private cleanupOldSessions(): void {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.metadata.lastUpdated > maxAge) {
        this.sessions.delete(sessionId);
      }
    }
  }

  /**
   * Check if forced break is required (blocks MCP operations)
   */
  isForcedBreakRequired(sessionId: string): boolean {
    const breakStatus = this.getBreakStatus(sessionId);
    return breakStatus.forcedBreak;
  }
}

// Singleton instance
export const activityTracker = new ActivityTracker();
