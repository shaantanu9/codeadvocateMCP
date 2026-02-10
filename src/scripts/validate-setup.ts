#!/usr/bin/env node
/**
 * Setup Validation Script
 *
 * Verifies that the MCP server is correctly configured:
 * - Checks required environment variables
 * - Tests connectivity to the main app
 * - Validates the API key
 *
 * Usage: npx tsx src/scripts/validate-setup.ts
 *    or: npm run validate
 */

import dotenv from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, "../../.env");

// Load env before anything else
dotenv.config({ path: envPath });

interface CheckResult {
  name: string;
  passed: boolean;
  message: string;
}

const results: CheckResult[] = [];

function check(name: string, passed: boolean, message: string) {
  results.push({ name, passed, message });
  const icon = passed ? "\x1b[32m\u2713\x1b[0m" : "\x1b[31m\u2717\x1b[0m";
  console.log(`  ${icon} ${name}: ${message}`);
}

async function main() {
  console.log("\n  CodeAdvocate MCP Server - Setup Validation\n");
  console.log("  ------------------------------------------\n");

  // 1. Check .env file exists
  const envExists = existsSync(envPath);
  check(".env file", envExists, envExists ? `Found at ${envPath}` : `Not found at ${envPath}. Copy .env.example to .env`);

  if (!envExists) {
    printSummary();
    return;
  }

  // 2. Check required env vars
  const port = process.env.PORT;
  check("PORT", !!port, port ? `Set to ${port}` : "Not set (defaults to 3001)");

  const externalApiUrl = process.env.EXTERNAL_API_URL;
  check(
    "EXTERNAL_API_URL",
    !!externalApiUrl,
    externalApiUrl ? externalApiUrl : "Not set. Set this to your main app URL (e.g. http://localhost:5656)"
  );

  const apiKey = process.env.EXTERNAL_API_KEY || process.env.MCP_SERVER_TOKEN;
  const keySource = process.env.EXTERNAL_API_KEY
    ? "EXTERNAL_API_KEY"
    : process.env.MCP_SERVER_TOKEN
      ? "MCP_SERVER_TOKEN"
      : null;
  check(
    "API Key",
    !!apiKey && apiKey !== "not-required",
    keySource
      ? `Configured via ${keySource} (${apiKey!.substring(0, 8)}...)`
      : "Not set. Set EXTERNAL_API_KEY to your sk_... API key"
  );

  if (!externalApiUrl) {
    console.log("\n  Skipping connectivity tests (no EXTERNAL_API_URL set)\n");
    printSummary();
    return;
  }

  // 3. Test connectivity
  console.log("");
  try {
    const healthUrl = `${externalApiUrl}/api/health`;
    const start = Date.now();
    const response = await fetch(healthUrl, {
      signal: AbortSignal.timeout(10000),
    });
    const latency = Date.now() - start;

    check(
      "Main app connectivity",
      response.ok,
      response.ok
        ? `Reachable (${latency}ms latency)`
        : `Responded with ${response.status} ${response.statusText}`
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    check(
      "Main app connectivity",
      false,
      `Unreachable: ${msg}. Is the main app running at ${externalApiUrl}?`
    );
    printSummary();
    return;
  }

  // 4. Validate API key
  if (apiKey && apiKey !== "not-required") {
    try {
      const verifyUrl = `${externalApiUrl}/api/api-keys/verify`;
      const response = await fetch(verifyUrl, {
        headers: { "X-API-Key": apiKey },
        signal: AbortSignal.timeout(10000),
      });

      const data = await response.json() as {
        valid?: boolean;
        user?: { name?: string; email?: string };
        apiKey?: { scopes?: string[] };
        error?: string;
      };

      if (data.valid) {
        const userName = data.user?.name || data.user?.email || "unknown";
        const scopes = data.apiKey?.scopes?.join(", ") || "none";
        check("API key validity", true, `Valid - User: ${userName}, Scopes: ${scopes}`);
      } else {
        check("API key validity", false, `Invalid: ${data.error || "API key rejected"}`);
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      check("API key validity", false, `Verification failed: ${msg}`);
    }
  } else {
    check("API key validity", false, "Skipped (no API key configured)");
  }

  printSummary();
}

function printSummary() {
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log("\n  ------------------------------------------");
  console.log(
    `  Results: \x1b[32m${passed} passed\x1b[0m, \x1b[31m${failed} failed\x1b[0m`
  );

  if (failed === 0) {
    console.log("  \x1b[32mAll checks passed! MCP server is ready.\x1b[0m\n");
  } else {
    console.log("  \x1b[33mFix the issues above and run again.\x1b[0m\n");
  }

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error("Validation script failed:", error);
  process.exit(1);
});
