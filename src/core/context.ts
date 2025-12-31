/**
 * Request Context Management
 *
 * Uses AsyncLocalStorage for request-scoped context management
 * This ensures thread-safe access to request data across async operations
 */

import { AsyncLocalStorage } from "node:async_hooks";
import type { RequestContext } from "./types.js";

/**
 * AsyncLocalStorage instance for request context
 */
const contextStorage = new AsyncLocalStorage<RequestContext>();

/**
 * Get the current request context
 * @returns Current request context or null if not in a request context
 */
export function getContext(): RequestContext | null {
  return contextStorage.getStore() || null;
}

/**
 * Get the current request token
 * @returns Current request token or null if not in a request context
 */
export function getRequestToken(): string | null {
  const context = getContext();
  return context?.token || null;
}

/**
 * Get the current request ID
 * @returns Current request ID or null if not in a request context
 */
export function getRequestId(): string | null {
  const context = getContext();
  return context?.requestId || null;
}

/**
 * Run a function within a request context
 * @param context The request context
 * @param fn The function to run
 * @returns The result of the function
 */
export function runInContext<T>(
  context: RequestContext,
  fn: () => T | Promise<T>
): Promise<T> {
  return Promise.resolve(contextStorage.run(context, fn));
}

/**
 * Check if we're currently in a request context
 * @returns True if in a request context, false otherwise
 */
export function hasContext(): boolean {
  return contextStorage.getStore() !== undefined;
}
