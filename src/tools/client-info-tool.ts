/**
 * Client Info Tool
 * 
 * Provides information about the client/editor using the MCP server
 */

import { z } from "zod";
import { BaseToolHandler } from "./base/tool-handler.base.js";
import { jsonResponse } from "../utils/response-formatter.js";
import { getContext } from "../core/context.js";
import { ClientType } from "../core/client-detector.js";
import type { BaseToolDefinition } from "./base/base-tool.interface.js";
import type { ClientInfo } from "../core/client-detector.js";

/**
 * Get client information tool
 */
class GetClientInfoHandler extends BaseToolHandler {
  protected toolName = "getClientInfo";

  async execute(_params: Record<string, never>): Promise<ReturnType<typeof jsonResponse>> {
    const { startTime } = this.logStart(this.toolName, {} as unknown as Record<string, unknown>);

    try {
      const context = getContext();
      
      if (!context) {
        return this.handleError(
          this.toolName,
          new Error("No context"),
          "No request context available",
          {} as unknown as Record<string, unknown>,
          startTime
        );
      }

      const clientInfo: ClientInfo = context.client || {
        type: ClientType.UNKNOWN as ClientType,
        name: "Unknown Client",
        detectedFrom: "unknown",
        confidence: "low",
        userAgent: context.userAgent,
      };

      return jsonResponse({
        success: true,
        data: {
          client: {
            type: clientInfo.type,
            name: clientInfo.name,
            version: clientInfo.version,
            platform: clientInfo.platform,
            userAgent: clientInfo.userAgent,
            detectedFrom: clientInfo.detectedFrom,
            confidence: clientInfo.confidence,
          },
          request: {
            requestId: context.requestId,
            ip: context.ip,
            timestamp: new Date(context.timestamp).toISOString(),
            sessionId: context.sessionId,
          },
          workspace: context.workspace
            ? {
                path: context.workspace.workspacePath,
                name: context.workspace.workspaceName,
                gitBranch: context.workspace.gitBranch,
              }
            : null,
        },
        metadata: {
          requestId: context.requestId,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (error) {
      return this.handleError(
        this.toolName,
        error as Error,
        "Failed to get client information",
        {} as unknown as Record<string, unknown>,
        startTime
      );
    }
  }
}

const handler = new GetClientInfoHandler();

export const getClientInfoTool: BaseToolDefinition<Record<string, never>> = {
  name: "getClientInfo",
  description:
    "Get information about the client/editor currently using the MCP server. Returns client type (Cursor, VS Code, Claude Desktop, etc.), version, platform, and detection confidence.",
  paramsSchema: z.object({}),
  execute: async (_params: Record<string, never>) => await handler.execute(_params),
};

