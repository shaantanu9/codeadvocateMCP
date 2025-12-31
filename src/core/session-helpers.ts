/**
 * Session Helper Functions
 * 
 * Convenience functions for accessing session and cache data from tools
 */

import { getContext } from "./context.js";
import { sessionManager } from "./session-manager.js";

/**
 * Get current session ID from context
 */
export function getCurrentSessionId(): string | null {
  const context = getContext();
  return context?.sessionId || null;
}

/**
 * Get current workspace path from context
 */
export function getCurrentWorkspacePath(): string | undefined {
  const context = getContext();
  return context?.workspace?.workspacePath;
}

/**
 * Get current workspace context
 */
export function getCurrentWorkspace() {
  const context = getContext();
  return context?.workspace || null;
}

/**
 * Get current session data
 */
export function getCurrentSession() {
  const context = getContext();
  return context?.session || null;
}

/**
 * Set data in current session
 */
export function setSessionData(key: string, value: unknown): boolean {
  const sessionId = getCurrentSessionId();
  if (!sessionId) {
    return false;
  }

  try {
    sessionManager.setSessionData(sessionId, key, value);
    return true;
  } catch (error) {
    console.error(`[SessionHelpers] Error setting session data:`, error);
    return false;
  }
}

/**
 * Get data from current session
 */
export function getSessionData<T = unknown>(key: string): T | null {
  const sessionId = getCurrentSessionId();
  if (!sessionId) {
    return null;
  }

  return sessionManager.getSessionData<T>(sessionId, key);
}

/**
 * Set cache with workspace-aware key
 */
export function setCache<T = unknown>(
  key: string,
  value: T,
  ttlSeconds: number = 300
): boolean {
  const workspacePath = getCurrentWorkspacePath();
  const cacheKey = sessionManager.getWorkspaceCacheKey(workspacePath, key);

  try {
    sessionManager.setCache(cacheKey, value, ttlSeconds);
    return true;
  } catch (error) {
    console.error(`[SessionHelpers] Error setting cache:`, error);
    return false;
  }
}

/**
 * Get cache with workspace-aware key
 */
export function getCache<T = unknown>(key: string): T | null {
  const workspacePath = getCurrentWorkspacePath();
  const cacheKey = sessionManager.getWorkspaceCacheKey(workspacePath, key);

  return sessionManager.getCache<T>(cacheKey);
}

/**
 * Get all session data
 */
export function getAllSessionData(): Record<string, unknown> | null {
  const session = getCurrentSession();
  return session?.data || null;
}

/**
 * Clear session data
 */
export function clearSessionData(): boolean {
  const sessionId = getCurrentSessionId();
  if (!sessionId) {
    return false;
  }

  const session = sessionManager.getSession(sessionId);
  if (session) {
    session.data = {};
    sessionManager.setSessionData(sessionId, "__cleared__", true);
    return true;
  }

  return false;
}




