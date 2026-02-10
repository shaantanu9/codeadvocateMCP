/**
 * Request Context Middleware
 *
 * Creates and manages request context using AsyncLocalStorage
 */

import { Request, Response, NextFunction } from "express";
import { randomUUID } from "node:crypto";
import { runInContext } from "../../core/context.js";
import type { RequestContext } from "../../core/types.js";
import { logger } from "../../core/logger.js";
import {
  detectWorkspacePath,
  getWorkspaceContext,
} from "../../core/workspace-context.js";
import { sessionManager } from "../../core/session-manager.js";
import {
  detectClient,
  getClientDescription,
} from "../../core/client-detector.js";
import { activityTracker } from "../../core/activity-tracker.js";

/**
 * Middleware to create request context with workspace and session support
 * Must be called before other middleware that need context
 */
export async function contextMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  // Extract token from headers
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  }

  if (!token) {
    token = req.headers["x-mcp-token"] as string | undefined;
  }

  // Detect workspace path from request
  const workspacePath = detectWorkspacePath({
    headers: req.headers as Record<string, string>,
    params: req.body?.params || req.query,
  });

  // Get workspace context
  const workspace = getWorkspaceContext(workspacePath);

  // Detect client information
  const clientDetection = detectClient(req);
  const clientInfo = {
    ip: req.ip || req.socket.remoteAddress || "unknown",
    userAgent: req.get("user-agent"),
  };

  // Log client detection (first request or when client changes)
  logger.info("Client detected", {
    client: getClientDescription(clientDetection),
    type: clientDetection.type,
    confidence: clientDetection.confidence,
    platform: clientDetection.platform,
  });

  const sessionId =
    (req.headers["x-session-id"] as string) ||
    (req.query.session_id as string) ||
    sessionManager.generateSessionId(clientInfo, workspacePath);

  const session = await sessionManager.getOrCreateSession(
    sessionId,
    clientInfo,
    workspacePath
  );

  // Track activity
  activityTracker.startSession(sessionId, clientDetection, workspacePath);

  // Check for forced break BEFORE recording activity (for MCP requests)
  if (req.path === "/mcp" && (req.method === "POST" || req.method === "GET")) {
    const forcedBreak = activityTracker.isForcedBreakRequired(sessionId);
    if (forcedBreak) {
      const breakStatus = activityTracker.getBreakStatus(sessionId);
      logger.warn("Forced break required - blocking request", {
        sessionId,
        timeSinceLastActivity: breakStatus.timeSinceLastBreak,
        path: req.path,
      });

      _res.status(429);
      _res.setHeader("Content-Type", "application/json");
      _res.json({
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message: breakStatus.message,
          data: {
            breakType: "forced",
            timeSinceLastActivity: breakStatus.timeSinceLastBreak,
            timeSinceLastActivityFormatted: `${Math.round(
              breakStatus.timeSinceLastBreak / 60000
            )} minutes`,
            requiredBreakDuration: 10, // minutes
            instructions: [
              "Please take a 10-minute break",
              "Step away from your computer",
              "After your break, use the 'recordBreak' tool to continue",
              "The MCP server will be unavailable until you take a break",
            ],
            toolToUse: "recordBreak",
          },
        },
        id: req.body?.id || req.query?.id || null,
      });
      return;
    }
  }

  // Record activity (only if not blocked by forced break)
  activityTracker.recordActivity(sessionId);

  // Create request context
  const context: RequestContext = {
    token: token || "",
    requestId: randomUUID(),
    ip: clientInfo.ip,
    userAgent: clientInfo.userAgent,
    timestamp: Date.now(),
    sessionId,
    workspace: workspace ?? undefined,
    session,
    client: clientDetection, // Add client detection to context
  };

  // Run request in context
  runInContext(context, () => {
    logger.debug("Request context created", {
      requestId: context.requestId,
      sessionId: context.sessionId,
      workspacePath: context.workspace?.workspacePath,
      path: req.path,
      method: req.method,
    });
    next();
  });
}
