/**
 * Core Types and Interfaces
 * 
 * Shared types and interfaces used across the application
 */

import type { WorkspaceContext } from "./workspace-context.js";
import type { SessionData } from "./session-manager.js";
import type { ClientInfo } from "./client-detector.js";

/**
 * Request context containing request-scoped data
 * Used with AsyncLocalStorage for thread-safe request context management
 */
export interface RequestContext {
  token: string;
  requestId: string;
  ip: string;
  userAgent?: string;
  timestamp: number;
  sessionId?: string;
  workspace?: WorkspaceContext;
  session?: SessionData;
  client?: ClientInfo; // Detected client information
}

/**
 * API response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  metadata?: {
    requestId: string;
    timestamp: number;
  };
}

/**
 * Service configuration
 */
export interface ServiceConfig {
  baseUrl: string;
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
}

/**
 * HTTP request options
 */
export interface HttpRequestOptions {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  endpoint: string;
  body?: unknown;
  queryParams?: Record<string, string | number | boolean>;
  headers?: Record<string, string>;
}

