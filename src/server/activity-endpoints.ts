/**
 * Activity Endpoints
 * 
 * HTTP endpoints for retrieving activity statistics and usage data
 */

import { Request, Response } from "express";
import { activityTracker } from "../core/activity-tracker.js";
import { logger } from "../core/logger.js";
import { getContext } from "../core/context.js";

/**
 * Get activity statistics for current session
 */
export function getActivityStats(_req: Request, res: Response): void {
  try {
    const context = getContext();
    
    if (!context || !context.sessionId) {
      res.status(400).json({
        error: "No active session",
        message: "No session context available",
      });
      return;
    }

    const stats = activityTracker.getActivityStats(context.sessionId);
    
    if (!stats) {
      res.status(404).json({
        error: "Session not found",
        message: "No activity data found for this session",
      });
      return;
    }

    // Format time for readability
    const formatTime = (ms: number): string => {
      const seconds = Math.floor(ms / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      
      if (hours > 0) {
        return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
      }
      if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
      }
      return `${seconds}s`;
    };

    res.json({
      success: true,
      data: {
        sessionId: stats.sessionId,
        totalActiveTime: stats.totalActiveTime,
        totalActiveTimeFormatted: formatTime(stats.totalActiveTime),
        breakCount: stats.breakCount,
        lastBreakTime: stats.lastBreakTime
          ? new Date(stats.lastBreakTime).toISOString()
          : null,
        lastActivityTime: new Date(stats.lastActivityTime).toISOString(),
        client: stats.clientInfo
          ? {
              type: stats.clientInfo.type,
              name: stats.clientInfo.name,
              version: stats.clientInfo.version,
              platform: stats.clientInfo.platform,
            }
          : null,
        workspace: stats.workspacePath || null,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Error getting activity stats", error);
    res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * Get all activity statistics
 */
export function getAllActivityStats(_req: Request, res: Response): void {
  try {
    const allStats = activityTracker.getAllActivityStats();

    // Format time for readability
    const formatTime = (ms: number): string => {
      const seconds = Math.floor(ms / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      
      if (hours > 0) {
        return `${hours}h ${minutes % 60}m`;
      }
      if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
      }
      return `${seconds}s`;
    };

    const formattedStats = allStats.map((stats) => ({
      sessionId: stats.sessionId,
      totalActiveTime: stats.totalActiveTime,
      totalActiveTimeFormatted: formatTime(stats.totalActiveTime),
      breakCount: stats.breakCount,
      lastBreakTime: stats.lastBreakTime
        ? new Date(stats.lastBreakTime).toISOString()
        : null,
      lastActivityTime: new Date(stats.lastActivityTime).toISOString(),
      client: stats.clientInfo
        ? {
            type: stats.clientInfo.type,
            name: stats.clientInfo.name,
            version: stats.clientInfo.version,
            platform: stats.clientInfo.platform,
          }
        : null,
      workspace: stats.workspacePath || null,
    }));

    res.json({
      success: true,
      data: {
        sessions: formattedStats,
        totalSessions: formattedStats.length,
        totalActiveTime: formattedStats.reduce(
          (sum, s) => sum + s.totalActiveTime,
          0
        ),
        totalBreaks: formattedStats.reduce((sum, s) => sum + s.breakCount, 0),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Error getting all activity stats", error);
    res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * Get break status for current session
 */
export function getBreakStatus(_req: Request, res: Response): void {
  try {
    const context = getContext();
    
    if (!context || !context.sessionId) {
      res.status(400).json({
        error: "No active session",
        message: "No session context available",
      });
      return;
    }

    const breakStatus = activityTracker.getBreakStatus(context.sessionId);

    // Format time
    const formatTime = (ms: number): string => {
      const minutes = Math.floor(ms / 60000);
      const hours = Math.floor(minutes / 60);
      if (hours > 0) {
        return `${hours}h ${minutes % 60}m`;
      }
      return `${minutes}m`;
    };

    res.json({
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
        sessionId: context.sessionId,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Error getting break status", error);
    res.status(500).json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

