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




