#!/usr/bin/env node

import http from "http";

const BASE_URL = "http://localhost:3111";
const MCP_TOKEN = process.env.MCP_TOKEN || "";

function makeRequest(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => {
        body += chunk;
      });
      res.on("end", () => {
        try {
          const parsed = body ? JSON.parse(body) : null;
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: parsed || body,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body,
          });
        }
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testServer() {
  console.log("🧪 Testing MCP Server\n");
  console.log("=".repeat(60));

  // Test 1: Health Check
  console.log("\n1️⃣  Testing Health Endpoint...");
  try {
    const health = await makeRequest("GET", "/health");
    console.log("✅ Health Check:", health.status === 200 ? "PASS" : "FAIL");
    console.log("   Response:", JSON.stringify(health.body, null, 2));
  } catch (error) {
    console.log("❌ Health Check: FAIL");
    console.log("   Error:", error.message);
    console.log(
      "\n⚠️  Server might not be running. Please start it with: npm run dev"
    );
    process.exit(1);
  }

  // Test 2: Root Endpoint
  console.log("\n2️⃣  Testing Root Endpoint...");
  try {
    const root = await makeRequest("GET", "/");
    console.log("✅ Root Endpoint:", root.status === 200 ? "PASS" : "FAIL");
    console.log("   Response:", JSON.stringify(root.body, null, 2));
  } catch (error) {
    console.log("❌ Root Endpoint: FAIL");
    console.log("   Error:", error.message);
  }

  // Test 3: Initialize Request
  console.log("\n3️⃣  Testing MCP Initialize...");
  const authHeaders = MCP_TOKEN ? { Authorization: `Bearer ${MCP_TOKEN}` } : {};

  try {
    const init = await makeRequest(
      "POST",
      "/mcp",
      {
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2024-11-05",
          capabilities: {},
          clientInfo: {
            name: "test-client",
            version: "1.0.0",
          },
        },
      },
      {
        ...authHeaders,
        "mcp-protocol-version": "2024-11-05",
      }
    );
    if (init.status === 401) {
      console.log("❌ Initialize: FAIL - Authentication required");
      console.log("   Error:", init.body.error?.message || "Unauthorized");
      console.log("\n💡 To test with authentication:");
      console.log("   MCP_TOKEN=your-token node test-mcp.js\n");
      return;
    }

    console.log("✅ Initialize:", init.status === 200 ? "PASS" : "FAIL");
    console.log("   Status:", init.status);
    console.log(
      "   Session ID:",
      init.headers["mcp-session-id"] || "Not found"
    );
    if (init.status === 200 && init.body.result) {
      console.log("   Server:", init.body.result.serverInfo?.name || "Unknown");
    }

    const sessionId = init.headers["mcp-session-id"];

    // Test 4: List Tools
    console.log("\n4️⃣  Testing List Tools (MCP tools/list)...");
    try {
      const tools = await makeRequest(
        "POST",
        "/mcp",
        {
          jsonrpc: "2.0",
          id: 2,
          method: "tools/list",
          params: {},
        },
        {
          ...authHeaders,
          "mcp-protocol-version": "2024-11-05",
          "mcp-session-id": sessionId || "",
        }
      );

      if (tools.status === 200 && tools.body.result) {
        const toolsList = tools.body.result.tools || [];
        console.log("✅ List Tools: PASS");
        console.log(`   Found ${toolsList.length} tools:\n`);

        toolsList.forEach((tool, index) => {
          console.log(`   ${index + 1}. ${tool.name}`);
          console.log(`      ${tool.description || "No description"}`);
        });
        console.log("");
      } else {
        console.log("❌ List Tools: FAIL");
        console.log("   Status:", tools.status);
        console.log("   Response:", JSON.stringify(tools.body, null, 2));
      }
    } catch (error) {
      console.log("❌ List Tools: FAIL");
      console.log("   Error:", error.message);
    }

    // Test 5: Call listAIModels Tool
    console.log("\n5️⃣  Testing Call listAIModels Tool...");
    try {
      const listModels = await makeRequest(
        "POST",
        "/mcp",
        {
          jsonrpc: "2.0",
          id: 3,
          method: "tools/call",
          params: {
            name: "listAIModels",
            arguments: {},
          },
        },
        {
          ...authHeaders,
          "mcp-protocol-version": "2024-11-05",
          "mcp-session-id": sessionId || "",
        }
      );
      console.log(
        "✅ Call listAIModels:",
        listModels.status === 200 ? "PASS" : "FAIL"
      );
      console.log("   Response:", JSON.stringify(listModels.body, null, 2));
    } catch (error) {
      console.log("❌ Call listAIModels: FAIL");
      console.log("   Error:", error.message);
    }

    // Test 6: Call getAIModelInfo Tool
    console.log("\n6️⃣  Testing Call getAIModelInfo Tool...");
    try {
      const modelInfo = await makeRequest(
        "POST",
        "/mcp",
        {
          jsonrpc: "2.0",
          id: 4,
          method: "tools/call",
          params: {
            name: "getAIModelInfo",
            arguments: {
              modelName: "shantanuDemo-3432",
            },
          },
        },
        {
          ...authHeaders,
          "mcp-protocol-version": "2024-11-05",
          "mcp-session-id": sessionId || "",
        }
      );
      console.log(
        "✅ Call getAIModelInfo:",
        modelInfo.status === 200 ? "PASS" : "FAIL"
      );
      console.log("   Response:", JSON.stringify(modelInfo.body, null, 2));
    } catch (error) {
      console.log("❌ Call getAIModelInfo: FAIL");
      console.log("   Error:", error.message);
    }
  } catch (error) {
    console.log("❌ Initialize: FAIL");
    console.log("   Error:", error.message);
  }

  console.log("\n" + "=".repeat(60));
  console.log("✅ Testing Complete!\n");
}

testServer().catch(console.error);
