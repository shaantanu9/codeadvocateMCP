/**
 * Client Info Tool
 * 
 * Provides information about the client/editor using the MCP server
 */

import { z } from "zod";
import { BaseToolHandler } from "./base/tool-handler.base.js";
import { jsonResponse } from "../utils/response-formatter.js";
import { getContext } from "../core/context.js";
import type { BaseToolDefinition } from "./base/base-tool.interface.js";
import type { ClientInfo } from "../core/client-detector.js";

/**
 * Get client information tool
 */
class GetClientInfoHandler extends BaseToolHandler {
  protected toolName = "getClientInfo";

  async execute(_params: Record<string, never>): Promise<ReturnType<typeof jsonResponse>> {
    this.logStart({});

    try {
      const context = getContext();
      
      if (!context) {
        return this.handleError("No request context available", new Error("No context"));
      }

      const clientInfo: ClientInfo = context.client || {
        type: "Unknown" as const,
        name: "Unknown Client",
        detectedFrom: "unknown" as const,
        confidence: "low" as const,
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
      return this.handleError("Failed to get client information", error as Error);
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

