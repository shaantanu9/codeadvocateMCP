/**
 * Test Connection Tool
 *
 * Diagnostic tool that verifies connectivity to the main app,
 * tests API key validity, and returns latency information.
 */

import { z } from "zod";
import { BaseToolHandler } from "../base/tool-handler.base.js";
import { jsonResponse } from "../../utils/response-formatter.js";
import { envConfig } from "../../config/env.js";
import type { BaseToolDefinition } from "../base/base-tool.interface.js";
import type { FormattedResponse } from "../../utils/response-formatter.js";

export interface TestConnectionParams {}

interface DiagnosticResult {
  status: "healthy" | "degraded" | "unreachable";
  mainApp: {
    url: string;
    reachable: boolean;
    latencyMs: number | null;
    error?: string;
  };
  apiKey: {
    configured: boolean;
    valid: boolean;
    keyPrefix?: string;
    scopes?: string[];
    userName?: string;
    error?: string;
  };
  timestamp: string;
}

class TestConnectionTool
  extends BaseToolHandler
  implements BaseToolDefinition<TestConnectionParams>
{
  name = "testConnection";
  description =
    "Test connectivity to the main CodeAdvocate app and verify API key validity. Use this when tools are failing with auth errors, timeouts, or connection issues. Returns health status, latency, and API key details.";

  paramsSchema = z.object({});

  async execute(_params: TestConnectionParams): Promise<FormattedResponse> {
    const { startTime } = this.logStart(this.name, {});

    const result: DiagnosticResult = {
      status: "healthy",
      mainApp: {
        url: envConfig.externalApiUrl,
        reachable: false,
        latencyMs: null,
      },
      apiKey: {
        configured: false,
        valid: false,
      },
      timestamp: new Date().toISOString(),
    };

    // 1. Test basic connectivity (health endpoint, no auth needed)
    try {
      const healthUrl = `${envConfig.externalApiUrl}/api/health`;
      const pingStart = Date.now();
      const healthResponse = await fetch(healthUrl, {
        signal: AbortSignal.timeout(10000),
      });
      result.mainApp.latencyMs = Date.now() - pingStart;

      if (healthResponse.ok) {
        result.mainApp.reachable = true;
      } else {
        result.mainApp.reachable = true; // Server responded, even if not 200
        result.mainApp.error = `Health check returned ${healthResponse.status}`;
        result.status = "degraded";
      }
    } catch (error) {
      result.mainApp.error =
        error instanceof Error ? error.message : "Connection failed";
      result.status = "unreachable";

      this.logSuccess(this.name, {}, startTime, {
        success: false,
        message: "Main app unreachable",
      });

      return jsonResponse(result, "Connection test completed");
    }

    // 2. Test API key validity
    try {
      const apiService = this.getApiService();
      const verifyResponse = await apiService.get<{
        valid: boolean;
        apiKey?: { keyPrefix: string; scopes: string[] };
        user?: { name: string; email: string };
        error?: string;
      }>("/api/api-keys/verify");

      if (verifyResponse.valid) {
        result.apiKey.configured = true;
        result.apiKey.valid = true;
        result.apiKey.keyPrefix = verifyResponse.apiKey?.keyPrefix;
        result.apiKey.scopes = verifyResponse.apiKey?.scopes;
        result.apiKey.userName = verifyResponse.user?.name;
      } else {
        result.apiKey.configured = true;
        result.apiKey.valid = false;
        result.apiKey.error = verifyResponse.error || "API key is invalid";
        result.status = "degraded";
      }
    } catch (error) {
      result.apiKey.configured =
        !!envConfig.externalApiKey &&
        envConfig.externalApiKey !== "not-required";
      result.apiKey.error =
        error instanceof Error ? error.message : "Verification failed";
      result.status = "degraded";
    }

    this.logSuccess(this.name, {}, startTime, {
      success: result.status === "healthy",
      message: `Connection ${result.status}`,
    });

    return jsonResponse(result, `Connection test: ${result.status}`);
  }
}

export const testConnectionTool = new TestConnectionTool();
