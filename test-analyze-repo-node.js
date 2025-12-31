#!/usr/bin/env node

/**
 * Node.js test script for analyzeAndSaveRepository tool
 * More comprehensive than bash script with better error handling
 */

// fetch is available in Node 18+

const MCP_SERVER_URL = process.env.MCP_SERVER_URL || "http://localhost:3111/mcp";
const API_KEY = process.env.API_KEY || "";
const REPOSITORY_ID = process.env.REPOSITORY_ID;
const PROJECT_ID = process.env.PROJECT_ID;

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  blue: "\x1b[34m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function makeMCPRequest(method, params, description) {
  log(`\n${"=".repeat(50)}`, colors.blue);
  log(`Testing: ${description}`, colors.yellow);
  log(`${"=".repeat(50)}`, colors.blue);

  const requestBody = {
    jsonrpc: "2.0",
    id: Date.now(),
    method: "tools/call",
    params: {
      name: "analyzeAndSaveRepository",
      arguments: params,
    },
  };

  try {
    const headers = {
      "Content-Type": "application/json",
    };

    if (API_KEY) {
      headers["X-API-Key"] = API_KEY;
    }

    const response = await fetch(MCP_SERVER_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.error) {
      log(`❌ Error: ${data.error.message || JSON.stringify(data.error)}`, colors.red);
      if (data.error.data) {
        console.log("Error details:", JSON.stringify(data.error.data, null, 2));
      }
      return { success: false, data };
    }

    log("✅ Request successful", colors.green);

    // Pretty print the result
    if (data.result) {
      console.log("\nResult:");
      console.log(JSON.stringify(data.result, null, 2));
    }

    return { success: true, data };
  } catch (error) {
    log(`❌ Request failed: ${error.message}`, colors.red);
    if (error.cause) {
      console.error("Cause:", error.cause);
    }
    return { success: false, error: error.message };
  }
}

async function runTests() {
  log("\n" + "=".repeat(50), colors.cyan);
  log("Testing analyzeAndSaveRepository Tool", colors.cyan);
  log("=".repeat(50), colors.cyan);

  const tests = [];

  // Test 1: Basic analysis
  tests.push({
    name: "Basic Analysis (No LLM, No API)",
    params: {
      projectPath: ".",
      deepAnalysis: true,
      useCache: false,
      forceRefresh: true,
    },
  });

  // Test 2: Analysis with cache
  tests.push({
    name: "Analysis with Cache",
    params: {
      projectPath: ".",
      deepAnalysis: true,
      useCache: true,
      forceRefresh: false,
    },
  });

  // Test 3: Analysis with LLM
  tests.push({
    name: "Analysis with LLM Enhancement",
    params: {
      projectPath: ".",
      deepAnalysis: true,
      useLLM: true,
      llmProvider: "auto",
      useCache: false,
      forceRefresh: false,
    },
  });

  // Test 4: Analysis with custom LLM prompt
  tests.push({
    name: "Analysis with Custom LLM Prompt",
    params: {
      projectPath: ".",
      deepAnalysis: true,
      useLLM: true,
      llmPrompt:
        "Extract all utility functions, identify coding patterns, and provide architectural insights",
      llmProvider: "auto",
      useCache: false,
      forceRefresh: false,
    },
  });

  // Test 5: Analysis with API save (if IDs provided)
  if (REPOSITORY_ID || PROJECT_ID) {
    tests.push({
      name: "Analysis with API Save",
      params: {
        projectPath: ".",
        ...(REPOSITORY_ID && { repositoryId: REPOSITORY_ID }),
        ...(PROJECT_ID && { projectId: PROJECT_ID }),
        deepAnalysis: true,
        useCache: false,
        forceRefresh: false,
      },
    });
  }

  // Test 6: Complete analysis (LLM + API)
  if (REPOSITORY_ID && PROJECT_ID) {
    tests.push({
      name: "Complete Analysis (LLM + API)",
      params: {
        projectPath: ".",
        repositoryId: REPOSITORY_ID,
        projectId: PROJECT_ID,
        deepAnalysis: true,
        useLLM: true,
        llmPrompt:
          "Comprehensive analysis: extract utility functions, coding standards, architecture patterns, and provide recommendations",
        llmProvider: "auto",
        useCache: false,
        forceRefresh: true,
      },
    });
  }

  // Run tests
  const results = [];
  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    log(`\n[Test ${i + 1}/${tests.length}] ${test.name}`, colors.cyan);
    
    const result = await makeMCPRequest("tools/call", test.params, test.name);
    results.push({ test: test.name, ...result });

    // Wait a bit between tests to avoid rate limiting
    if (i < tests.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  // Summary
  log("\n" + "=".repeat(50), colors.cyan);
  log("Test Summary", colors.cyan);
  log("=".repeat(50), colors.cyan);

  const passed = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  results.forEach((result, index) => {
    const status = result.success ? "✅ PASS" : "❌ FAIL";
    const color = result.success ? colors.green : colors.red;
    log(`${index + 1}. ${result.test}: ${status}`, color);
  });

  log(`\nTotal: ${results.length} | Passed: ${passed} | Failed: ${failed}`, 
    failed > 0 ? colors.red : colors.green);

  return failed === 0;
}

// Run tests
runTests()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    log(`\n❌ Test runner failed: ${error.message}`, colors.red);
    console.error(error);
    process.exit(1);
  });

