/**
 * Base Tool Interface
 * 
 * Defines the contract for all MCP tools to ensure consistency and scalability
 */

import { z } from "zod";
import type { FormattedResponse } from "../../utils/response-formatter.js";

/**
 * Tool execution context
 */
export interface ToolContext {
  [key: string]: unknown;
}

/**
 * MCP Tool Annotations (advisory hints for clients)
 *
 * These help MCP clients (Cursor, Claude Desktop, ChatGPT, etc.)
 * understand what a tool does and display appropriate safety indicators.
 * They are hints only — not security features.
 */
export interface ToolAnnotations {
  /** true if the tool does not modify its environment */
  readOnlyHint?: boolean;
  /** true if the tool may perform destructive updates (delete, overwrite) */
  destructiveHint?: boolean;
  /** true if repeated calls with the same args produce the same result */
  idempotentHint?: boolean;
  /** true if the tool interacts with external entities beyond the MCP server */
  openWorldHint?: boolean;
  /** Index signature for SDK compatibility */
  [key: string]: unknown;
}

/**
 * Base tool definition
 */
export interface BaseToolDefinition<TParams = unknown> {
  /**
   * Unique tool name (must be valid identifier)
   */
  name: string;

  /**
   * Human-readable description of what the tool does
   */
  description: string;

  /**
   * Zod schema for tool parameters validation
   */
  paramsSchema: z.ZodType<TParams>;

  /**
   * MCP tool annotations — advisory hints for clients
   */
  annotations?: ToolAnnotations;

  /**
   * Execute the tool with given parameters
   * @param params - Validated tool parameters
   * @param context - Optional execution context
   * @returns Formatted response for MCP
   */
  execute(params: TParams, context?: ToolContext): Promise<FormattedResponse>;
}

/**
 * Tool metadata for registration
 */
export interface ToolMetadata {
  name: string;
  description: string;
  paramsSchema: z.ZodRawShape;
}




