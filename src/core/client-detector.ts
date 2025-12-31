/**
 * Client Detection Utility
 * 
 * Detects which editor/application is using the MCP server
 * by analyzing request headers, user agent, and environment variables.
 */

import { Request } from "express";

/**
 * Known MCP client types
 */
export enum ClientType {
  CURSOR = "Cursor IDE",
  VS_CODE = "Visual Studio Code",
  CLAUDE_DESKTOP = "Claude Desktop",
  CONTINUE = "Continue",
  AIDER = "Aider",
  CODY = "Sourcegraph Cody",
  CURSES = "Curses",
  UNKNOWN = "Unknown",
  BROWSER = "Browser",
  CUSTOM = "Custom Client",
}

/**
 * Detected client information
 */
export interface ClientInfo {
  type: ClientType;
  name: string;
  version?: string;
  platform?: string;
  userAgent?: string;
  detectedFrom: "user-agent" | "header" | "environment" | "unknown";
  confidence: "high" | "medium" | "low";
}

/**
 * Detect client from User-Agent string
 */
function detectFromUserAgent(userAgent?: string): Partial<ClientInfo> | null {
  if (!userAgent) return null;

  const ua = userAgent.toLowerCase();

  // Cursor IDE
  if (ua.includes("cursor")) {
    const versionMatch = userAgent.match(/Cursor\/([\d.]+)/i);
    return {
      type: ClientType.CURSOR,
      name: "Cursor IDE",
      version: versionMatch?.[1],
      detectedFrom: "user-agent" as const,
      confidence: "high" as const,
    };
  }

  // VS Code
  if (ua.includes("vscode") || ua.includes("code")) {
    const versionMatch = userAgent.match(/(?:VSCode|Code)\/([\d.]+)/i);
    return {
      type: ClientType.VS_CODE,
      name: "Visual Studio Code",
      version: versionMatch?.[1],
      detectedFrom: "user-agent" as const,
      confidence: "high" as const,
    };
  }

  // Claude Desktop
  if (ua.includes("claude") && (ua.includes("desktop") || ua.includes("app"))) {
    const versionMatch = userAgent.match(/Claude[\/\s]([\d.]+)/i);
    return {
      type: ClientType.CLAUDE_DESKTOP,
      name: "Claude Desktop",
      version: versionMatch?.[1],
      detectedFrom: "user-agent" as const,
      confidence: "high" as const,
    };
  }

  // Continue
  if (ua.includes("continue")) {
    return {
      type: ClientType.CONTINUE,
      name: "Continue",
      detectedFrom: "user-agent" as const,
      confidence: "medium" as const,
    };
  }

  // Aider
  if (ua.includes("aider")) {
    return {
      type: ClientType.AIDER,
      name: "Aider",
      detectedFrom: "user-agent" as const,
      confidence: "medium" as const,
    };
  }

  // Sourcegraph Cody
  if (ua.includes("cody") || ua.includes("sourcegraph")) {
    return {
      type: ClientType.CODY,
      name: "Sourcegraph Cody",
      detectedFrom: "user-agent" as const,
      confidence: "medium" as const,
    };
  }

  // Browser detection
  if (
    ua.includes("mozilla") ||
    ua.includes("chrome") ||
    ua.includes("safari") ||
    ua.includes("firefox") ||
    ua.includes("edge")
  ) {
    return {
      type: ClientType.BROWSER,
      name: "Browser",
      detectedFrom: "user-agent" as const,
      confidence: "high" as const,
    };
  }

  return null;
}

/**
 * Detect client from custom headers
 */
function detectFromHeaders(req: Request): Partial<ClientInfo> | null {
  // Check for custom MCP client headers
  const clientHeader =
    req.headers["x-mcp-client"] ||
    req.headers["x-client-type"] ||
    req.headers["x-editor"] ||
    req.headers["x-application"];

  if (clientHeader) {
    const clientStr = String(clientHeader).toLowerCase();

    if (clientStr.includes("cursor")) {
      return {
        type: ClientType.CURSOR,
        name: "Cursor IDE",
        detectedFrom: "header" as const,
        confidence: "high" as const,
      };
    }

    if (clientStr.includes("vscode") || clientStr.includes("code")) {
      return {
        type: ClientType.VS_CODE,
        name: "Visual Studio Code",
        detectedFrom: "header" as const,
        confidence: "high" as const,
      };
    }

    if (clientStr.includes("claude")) {
      return {
        type: ClientType.CLAUDE_DESKTOP,
        name: "Claude Desktop",
        detectedFrom: "header" as const,
        confidence: "high" as const,
      };
    }

    // Generic custom client
    return {
      type: ClientType.CUSTOM,
      name: String(clientHeader),
      detectedFrom: "header" as const,
      confidence: "medium" as const,
    };
  }

  return null;
}

/**
 * Detect client from environment variables
 */
function detectFromEnvironment(): Partial<ClientInfo> | null {
  // Check for editor-specific environment variables
  const termProgram = process.env.TERM_PROGRAM;
  const editor = process.env.EDITOR;
  const cursorWorkspace = process.env.CURSOR_WORKSPACE;

  if (cursorWorkspace || termProgram === "cursor") {
    return {
      type: ClientType.CURSOR,
      name: "Cursor IDE",
      detectedFrom: "environment" as const,
      confidence: "medium" as const,
    };
  }

  if (termProgram === "vscode") {
    return {
      type: ClientType.VS_CODE,
      name: "Visual Studio Code",
      detectedFrom: "environment" as const,
      confidence: "medium" as const,
    };
  }

  if (editor) {
    const editorLower = editor.toLowerCase();
    if (editorLower.includes("cursor")) {
      return {
        type: ClientType.CURSOR,
        name: "Cursor IDE",
        detectedFrom: "environment" as const,
        confidence: "low" as const,
      };
    }
    if (editorLower.includes("code") || editorLower.includes("vscode")) {
      return {
        type: ClientType.VS_CODE,
        name: "Visual Studio Code",
        detectedFrom: "environment" as const,
        confidence: "low" as const,
      };
    }
  }

  return null;
}

/**
 * Extract platform from User-Agent
 */
function extractPlatform(userAgent?: string): string | undefined {
  if (!userAgent) return undefined;

  const ua = userAgent.toLowerCase();

  if (ua.includes("darwin") || ua.includes("mac")) {
    return "macOS";
  }
  if (ua.includes("win") || ua.includes("windows")) {
    return "Windows";
  }
  if (ua.includes("linux")) {
    return "Linux";
  }
  if (ua.includes("android")) {
    return "Android";
  }
  if (ua.includes("ios") || ua.includes("iphone") || ua.includes("ipad")) {
    return "iOS";
  }

  return undefined;
}

/**
 * Detect client information from request
 * 
 * @param req Express request object
 * @returns Detected client information
 */
export function detectClient(req: Request): ClientInfo {
  const userAgent = req.get("user-agent");

  // Try detection methods in order of reliability
  let detected: Partial<ClientInfo> | null = null;

  // 1. Try User-Agent (most reliable)
  detected = detectFromUserAgent(userAgent);
  if (detected) {
    return {
      ...detected,
      userAgent,
      platform: extractPlatform(userAgent),
    } as ClientInfo;
  }

  // 2. Try custom headers
  detected = detectFromHeaders(req);
  if (detected) {
    return {
      ...detected,
      userAgent,
      platform: extractPlatform(userAgent),
    } as ClientInfo;
  }

  // 3. Try environment variables
  detected = detectFromEnvironment();
  if (detected) {
    return {
      ...detected,
      userAgent,
      platform: extractPlatform(userAgent),
    } as ClientInfo;
  }

  // 4. Fallback to unknown
  return {
    type: ClientType.UNKNOWN,
    name: "Unknown Client",
    userAgent,
    platform: extractPlatform(userAgent),
    detectedFrom: "unknown",
    confidence: "low",
  };
}

/**
 * Get a human-readable client description
 */
export function getClientDescription(clientInfo: ClientInfo): string {
  const parts: string[] = [clientInfo.name];

  if (clientInfo.version) {
    parts.push(`v${clientInfo.version}`);
  }

  if (clientInfo.platform) {
    parts.push(`on ${clientInfo.platform}`);
  }

  parts.push(`(detected via ${clientInfo.detectedFrom}, ${clientInfo.confidence} confidence)`);

  return parts.join(" ");
}

/**
 * Check if client is a known IDE/editor
 */
export function isIDE(clientInfo: ClientInfo): boolean {
  return [
    ClientType.CURSOR,
    ClientType.VS_CODE,
    ClientType.CONTINUE,
    ClientType.AIDER,
    ClientType.CODY,
  ].includes(clientInfo.type);
}

/**
 * Check if client is a browser
 */
export function isBrowser(clientInfo: ClientInfo): boolean {
  return clientInfo.type === ClientType.BROWSER;
}



