/**
 * Test helpers and utilities for MCP testing
 */

import { vi } from "vitest";
import type { Request, Response } from "express";
import type { RequestContext } from "../../src/core/types.js";

/**
 * Create a mock Express request
 */
export function createMockRequest(overrides?: Partial<Request>): Partial<Request> {
  return {
    headers: {},
    body: {},
    query: {},
    params: {},
    get: vi.fn(),
    ...overrides,
  } as Partial<Request>;
}

/**
 * Create a mock Express response
 */
export function createMockResponse(): Partial<Response> {
  const res: Partial<Response> = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
    setHeader: vi.fn().mockReturnThis(),
  };
  return res;
}

/**
 * Create a mock request context
 */
export function createMockContext(
  overrides?: Partial<RequestContext>
): RequestContext {
  return {
    requestId: "test-request-id",
    token: "test-token",
    ...overrides,
  };
}

/**
 * Wait for async operations
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Mock MCP tool call response
 */
export function createMockToolResponse(data: unknown) {
  return {
    jsonrpc: "2.0",
    id: 1,
    result: {
      content: [
        {
          type: "text",
          text: typeof data === "string" ? data : JSON.stringify(data),
        },
      ],
    },
  };
}
