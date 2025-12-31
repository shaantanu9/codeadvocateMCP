/**
 * Request Context Utilities
 * 
 * Provides access to request-scoped data like authentication tokens
 * for use in MCP tools.
 */

// Store current request token in a global variable (per request)
// Since MCP tools are called within the same request context,
// we can store the token here temporarily
let currentRequestToken: string | null = null;

/**
 * Set the current request token (called from middleware)
 */
export function setRequestToken(token: string): void {
  currentRequestToken = token;
}

/**
 * Get the current request token (called from tools)
 */
export function getRequestToken(): string | null {
  return currentRequestToken;
}

/**
 * Clear the request token (called after request completes)
 */
export function clearRequestToken(): void {
  currentRequestToken = null;
}




