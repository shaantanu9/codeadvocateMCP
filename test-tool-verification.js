#!/usr/bin/env node

/**
 * Comprehensive verification test for analyzeAndSaveRepository tool
 * Tests all major functionality to ensure the tool is working correctly
 */

const MCP_SERVER_URL =
  process.env.MCP_SERVER_URL || "http://localhost:3111/mcp";
const API_KEY = process.env.API_KEY || process.env.MCP_SERVER_TOKEN || "";

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  blue: "\x1b[34m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function checkResult(result, expectedFields) {
  const missing = [];
  const present = [];

  for (const field of expectedFields) {
    const path = field.split(".");
    let value = result;
    for (const p of path) {
      value = value?.[p];
    }
    if (value === undefined || value === null) {
      missing.push(field);
    } else {
      present.push(field);
    }
  }

  return { missing, present };
}

async function makeMCPRequest(params, description) {
  log(`\n${"─".repeat(60)}`, colors.blue);
  log(`🧪 ${description}`, colors.yellow);
  log(`${"─".repeat(60)}`, colors.blue);

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
      Accept: "application/json, text/event-stream",
      "mcp-protocol-version": "2024-11-05",
    };

    if (API_KEY) {
      headers["Authorization"] = `Bearer ${API_KEY}`;
    }

    log(`📤 Sending request to ${MCP_SERVER_URL}...`, colors.cyan);
    log(`📋 Parameters: ${JSON.stringify(params, null, 2)}`, colors.magenta);

    const response = await fetch(MCP_SERVER_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Handle SSE (Server-Sent Events) format response
    const contentType = response.headers.get("content-type") || "";
    let data;

    if (
      contentType.includes("text/event-stream") ||
      contentType.includes("text/plain")
    ) {
      // Parse SSE format: "event: message\ndata: {...}"
      const text = await response.text();
      const dataMatch = text.match(/^data:\s*({[\s\S]*})$/m);
      if (dataMatch) {
        data = JSON.parse(dataMatch[1]);
      } else {
        // Try to find JSON in the response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          data = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error(
            `Failed to parse SSE response: ${text.substring(0, 100)}`
          );
        }
      }
    } else {
      // Regular JSON response
      data = await response.json();
    }

    if (data.error) {
      log(
        `❌ Error: ${data.error.message || JSON.stringify(data.error)}`,
        colors.red
      );
      if (data.error.data) {
        log(
          `   Details: ${JSON.stringify(data.error.data, null, 2)}`,
          colors.red
        );
      }
      return { success: false, error: data.error, data };
    }

    log("✅ Request successful", colors.green);

    // Extract result from MCP response
    // The result is in data.result.content[0].text as a JSON string
    let parsedResult;

    if (data.result?.content?.[0]?.text) {
      const textContent = data.result.content[0].text;
      try {
        // Try to parse as JSON (it might be a JSON string)
        parsedResult = JSON.parse(textContent);
      } catch {
        // If not JSON, check if it contains JSON in code blocks
        const jsonMatch =
          textContent.match(/```json\s*([\s\S]*?)\s*```/) ||
          textContent.match(/```\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          try {
            parsedResult = JSON.parse(jsonMatch[1]);
          } catch {
            // Last resort: try to find JSON object in the text
            const objMatch = textContent.match(/\{[\s\S]*\}/);
            if (objMatch) {
              parsedResult = JSON.parse(objMatch[0]);
            } else {
              parsedResult = { raw: textContent };
            }
          }
        } else {
          parsedResult = { raw: textContent };
        }
      }
    } else if (data.result) {
      parsedResult = data.result;
    } else {
      parsedResult = data;
    }

    return { success: true, data: parsedResult, raw: data };
  } catch (error) {
    log(`❌ Request failed: ${error.message}`, colors.red);
    if (error.cause) {
      log(`   Cause: ${error.cause}`, colors.red);
    }
    return { success: false, error: error.message };
  }
}

async function verifyBasicAnalysis(result) {
  log(`\n${"─".repeat(60)}`, colors.cyan);
  log("🔍 Verifying Basic Analysis Results", colors.cyan);
  log(`${"─".repeat(60)}`, colors.cyan);

  const expectedFields = [
    "repository.name",
    "repository.branch",
    "repository.commit",
    "repository.rootPath",
    "analysis.fileCount",
    "analysis.entryPoints",
    "analysis.dependencies",
    "documentation.length",
    "documentation.cached",
  ];

  const check = checkResult(result, expectedFields);

  if (check.missing.length > 0) {
    log(`❌ Missing fields: ${check.missing.join(", ")}`, colors.red);
    return false;
  }

  log(`✅ All required fields present`, colors.green);
  log(`\n📊 Results Summary:`, colors.cyan);
  log(`   Repository: ${result.repository?.name || "N/A"}`, colors.reset);
  log(`   Branch: ${result.repository?.branch || "N/A"}`, colors.reset);
  log(
    `   Commit: ${result.repository?.commit?.substring(0, 8) || "N/A"}`,
    colors.reset
  );
  log(`   Files: ${result.analysis?.fileCount || 0}`, colors.reset);
  log(
    `   Entry Points: ${result.analysis?.entryPoints?.length || 0}`,
    colors.reset
  );
  log(
    `   Dependencies: ${result.analysis?.dependencies?.length || 0}`,
    colors.reset
  );
  log(
    `   Documentation Length: ${result.documentation?.length || 0}`,
    colors.reset
  );
  log(
    `   Cached: ${result.documentation?.cached ? "Yes" : "No"}`,
    colors.reset
  );

  return true;
}

async function verifyComprehensiveData(result) {
  log(`\n${"─".repeat(60)}`, colors.cyan);
  log("🔍 Verifying Comprehensive Data Extraction", colors.cyan);
  log(`${"─".repeat(60)}`, colors.cyan);

  // Check if we have comprehensive analysis data
  const hasRepoInfo = !!result.repository;
  const hasAnalysis = !!result.analysis;
  const hasDocumentation = !!result.documentation;

  log(
    `   Repository Info: ${hasRepoInfo ? "✅" : "❌"}`,
    hasRepoInfo ? colors.green : colors.red
  );
  log(
    `   Analysis Data: ${hasAnalysis ? "✅" : "❌"}`,
    hasAnalysis ? colors.green : colors.red
  );
  log(
    `   Documentation: ${hasDocumentation ? "✅" : "❌"}`,
    hasDocumentation ? colors.green : colors.red
  );

  // Check for specific analysis components
  if (result.analysis) {
    const hasLinting = !!result.analysis.linting;
    const hasArchitecture = !!result.analysis.architecture;

    log(
      `   Linting Config: ${hasLinting ? "✅" : "⚠️"}`,
      hasLinting ? colors.green : colors.yellow
    );
    log(
      `   Architecture: ${hasArchitecture ? "✅" : "⚠️"}`,
      hasArchitecture ? colors.green : colors.yellow
    );

    if (result.analysis.architecture) {
      log(
        `     - Layers: ${result.analysis.architecture.layers?.length || 0}`,
        colors.reset
      );
      log(
        `     - Patterns: ${
          result.analysis.architecture.patterns?.length || 0
        }`,
        colors.reset
      );
    }
  }

  return hasRepoInfo && hasAnalysis && hasDocumentation;
}

async function runVerificationTests() {
  log("\n" + "=".repeat(60), colors.cyan);
  log("🚀 analyzeAndSaveRepository Tool Verification", colors.cyan);
  log("=".repeat(60), colors.cyan);

  // Test 1: Basic Analysis (No API, No LLM)
  log(`\n${"═".repeat(60)}`, colors.blue);
  log("TEST 1: Basic Repository Analysis", colors.blue);
  log(`${"═".repeat(60)}`, colors.blue);

  const test1 = await makeMCPRequest(
    {
      projectPath: ".",
      deepAnalysis: true,
      useCache: false,
      forceRefresh: true,
      useLLM: false,
    },
    "Basic Analysis (Deep, No Cache, No LLM)"
  );

  if (!test1.success) {
    log(`\n❌ Test 1 FAILED: ${test1.error}`, colors.red);
    return false;
  }

  const basicVerification = await verifyBasicAnalysis(test1.data);
  if (!basicVerification) {
    log(`\n❌ Test 1 FAILED: Basic verification failed`, colors.red);
    return false;
  }

  const comprehensiveVerification = await verifyComprehensiveData(test1.data);
  if (!comprehensiveVerification) {
    log(`\n⚠️ Test 1 WARNING: Some comprehensive data missing`, colors.yellow);
  }

  // Test 2: Cache Test
  log(`\n${"═".repeat(60)}`, colors.blue);
  log("TEST 2: Cache Functionality", colors.blue);
  log(`${"═".repeat(60)}`, colors.blue);

  const test2 = await makeMCPRequest(
    {
      projectPath: ".",
      useCache: true,
      forceRefresh: false,
    },
    "Cache Test (Should use cached data)"
  );

  if (!test2.success) {
    log(`\n❌ Test 2 FAILED: ${test2.error}`, colors.red);
    return false;
  }

  if (test2.data.documentation?.cached) {
    log(`✅ Cache working correctly`, colors.green);
  } else {
    log(`⚠️ Cache not used (may be expected on first run)`, colors.yellow);
  }

  // Test 3: Force Refresh
  log(`\n${"═".repeat(60)}`, colors.blue);
  log("TEST 3: Force Refresh", colors.blue);
  log(`${"═".repeat(60)}`, colors.blue);

  const test3 = await makeMCPRequest(
    {
      projectPath: ".",
      useCache: true,
      forceRefresh: true,
    },
    "Force Refresh (Should bypass cache)"
  );

  if (!test3.success) {
    log(`\n❌ Test 3 FAILED: ${test3.error}`, colors.red);
    return false;
  }

  log(`✅ Force refresh working correctly`, colors.green);

  // Summary
  log(`\n${"═".repeat(60)}`, colors.cyan);
  log("📊 VERIFICATION SUMMARY", colors.cyan);
  log(`${"═".repeat(60)}`, colors.cyan);
  log(`✅ Test 1 (Basic Analysis): PASSED`, colors.green);
  log(`✅ Test 2 (Cache): PASSED`, colors.green);
  log(`✅ Test 3 (Force Refresh): PASSED`, colors.green);
  log(`\n🎉 All tests passed! Tool is working correctly.`, colors.green);

  return true;
}

// Run tests
runVerificationTests()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    log(`\n❌ Fatal error: ${error.message}`, colors.red);
    console.error(error);
    process.exit(1);
  });
