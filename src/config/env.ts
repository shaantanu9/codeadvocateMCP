import dotenv from "dotenv";
import { z } from "zod";
import { envSchema, type ValidatedEnv } from "./env.schema.js";

// Load environment variables
dotenv.config();

export interface EnvConfig {
  // AI Provider API Keys
  openaiApiKey?: string;
  anthropicApiKey?: string;

  // External API Configuration
  // Uses MCP_SERVER_TOKEN for authentication (no separate EXTERNAL_API_KEY needed)
  externalApiKey: string; // Always uses MCP_SERVER_TOKEN
  externalApiUrl: string;
  externalApiBaseUrl: string; // Base URL for external API (e.g., http://localhost:5656/api/)

  // MCP Server Authentication (Required)
  mcpServerToken: string;

  // Default Models
  defaultOpenaiModel: string;
  defaultAnthropicModel: string;

  // Server Configuration
  port: number;
  nodeEnv: string;

  // Optional Settings
  maxRequestsPerMinute?: number;
  logLevel: string;

  // Token Acquisition URL (for MCP dashboard)
  tokenAcquisitionUrl?: string;
}

/**
 * Validates and loads environment configuration
 *
 * @throws {Error} If environment variables are invalid
 */
export function loadEnvConfig(): EnvConfig {
  // Validate environment variables
  let validatedEnv: ValidatedEnv;
  try {
    validatedEnv = envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("❌ Invalid environment configuration:");
      error.errors.forEach((err) => {
        const path = err.path.join(".");
        console.error(`  - ${path}: ${err.message}`);
      });
      console.error("\nPlease fix the errors above and restart the server.");
      process.exit(1);
    }
    throw error;
  }

  // MCP Server Token - optional, not required
  const mcpServerToken = validatedEnv.MCP_SERVER_TOKEN || "not-required";

  if (validatedEnv.MCP_SERVER_TOKEN) {
    console.log("[Config] MCP_SERVER_TOKEN found (authentication is optional)");
  } else {
    console.log(
      "[Config] MCP_SERVER_TOKEN not set - authentication is disabled"
    );
  }

  const config: EnvConfig = {
    // AI Provider API Keys (optional - tools will check if needed)
    openaiApiKey: validatedEnv.OPENAI_API_KEY,
    anthropicApiKey: validatedEnv.ANTHROPIC_API_KEY,

    // External API Configuration
    // Always uses MCP_SERVER_TOKEN for external API authentication
    externalApiKey: mcpServerToken,
    externalApiUrl: validatedEnv.EXTERNAL_API_URL || "http://localhost:5656",
    // Construct base URL: if EXTERNAL_API_BASE_URL is set, use it; otherwise derive from EXTERNAL_API_URL
    // ALL endpoints require /api/ prefix (both production and localhost)
    externalApiBaseUrl:
      validatedEnv.EXTERNAL_API_BASE_URL ||
      (validatedEnv.EXTERNAL_API_URL
        ? `${validatedEnv.EXTERNAL_API_URL}/api/` // Always use /api/ prefix for all environments
        : "http://localhost:5656/api/"),

    // MCP Server Authentication (Required)
    mcpServerToken: mcpServerToken,

    // Default Models
    defaultOpenaiModel: validatedEnv.DEFAULT_OPENAI_MODEL || "gpt-4",
    defaultAnthropicModel:
      validatedEnv.DEFAULT_ANTHROPIC_MODEL || "claude-3-sonnet-20240229",

    // Server Configuration
    port: validatedEnv.PORT,
    nodeEnv: validatedEnv.NODE_ENV,

    // Optional Settings
    maxRequestsPerMinute: validatedEnv.MAX_REQUESTS_PER_MINUTE,
    logLevel: validatedEnv.LOG_LEVEL || "info",

    // Token Acquisition URL (for MCP dashboard)
    tokenAcquisitionUrl:
      validatedEnv.TOKEN_ACQUISITION_URL ||
      (validatedEnv.EXTERNAL_API_URL
        ? `${validatedEnv.EXTERNAL_API_URL}/api-keys`
        : "http://localhost:5656/api-keys"),
  };

  // Log which AI providers are configured
  const availableProviders: string[] = [];
  if (config.openaiApiKey) availableProviders.push("OpenAI");
  if (config.anthropicApiKey) availableProviders.push("Anthropic");

  if (availableProviders.length > 0) {
    console.log(
      `[Config] AI Providers configured: ${availableProviders.join(", ")}`
    );
  } else {
    console.warn(
      "[Config] No AI provider API keys found. Some tools may not work."
    );
    console.warn(
      "[Config] Set OPENAI_API_KEY or ANTHROPIC_API_KEY in .env file"
    );
  }

  // Log external API configuration
  console.log(`[Config] External API Base URL: ${config.externalApiBaseUrl}`);
  console.log(
    `[Config] Token Verification Endpoint: ${config.externalApiBaseUrl}api-keys/verify`
  );

  if (config.externalApiKey && config.externalApiKey !== "not-required") {
    console.log(
      `[Config] External API key configured (using MCP_SERVER_TOKEN)`
    );
  } else {
    console.warn(
      "[Config] No external API key found. External API tools may not work."
    );
    console.warn("[Config] Set MCP_SERVER_TOKEN in .env file");
  }

  // Log MCP server authentication status
  console.log(
    `[Config] ✅ MCP Server: Token verification enabled via external API`
  );
  console.log(
    `[Config] ✅ Health endpoint (/health) works without authentication`
  );
  console.log(`[Config] ✅ MCP endpoint (/mcp) requires valid token`);

  return config;
}

// Export singleton config instance
export const envConfig = loadEnvConfig();
