#!/usr/bin/env node

/**
 * Test script for MCP server with authentication
 * Tests health endpoint (no auth) and MCP endpoint (with auth)
 */

import http from 'http';

const BASE_URL = 'http://localhost:3111';
const MCP_TOKEN = process.env.MCP_TOKEN || ''; // Get token from environment or use empty

function makeRequest(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = body ? JSON.parse(body) : null;
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: parsed || body
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testServer() {
  console.log('🧪 Testing Demo MCP Server\n');
  console.log('='.repeat(70));

  // Test 1: Health Check (No Auth Required)
  console.log('\n1️⃣  Testing Health Endpoint (No Auth Required)...');
  try {
    const health = await makeRequest('GET', '/health');
    if (health.status === 200) {
      console.log('   ✅ Health Check: PASS');
      console.log('   Status:', health.body.status);
      console.log('   Server:', health.body.server.name, health.body.server.version);
    } else {
      console.log('   ❌ Health Check: FAIL');
      console.log('   Status:', health.status);
    }
  } catch (error) {
    console.log('   ❌ Health Check: FAIL');
    console.log('   Error:', error.message);
    console.log('\n⚠️  Server might not be running. Please start it with: npm run dev');
    process.exit(1);
  }

  // Test 2: MCP Endpoint Without Token (Should Fail)
  console.log('\n2️⃣  Testing MCP Endpoint Without Token (Should Fail)...');
  try {
    const noAuth = await makeRequest('POST', '/mcp', {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/list',
      params: {}
    });
    if (noAuth.status === 401) {
      console.log('   ✅ Correctly rejected (401 Unauthorized)');
      console.log('   Error:', noAuth.body.error?.message || 'Unauthorized');
    } else {
      console.log('   ⚠️  Unexpected status:', noAuth.status);
    }
  } catch (error) {
    console.log('   ❌ Request failed:', error.message);
  }

  // Test 3: MCP Endpoint With Token (If provided)
  if (MCP_TOKEN) {
    console.log('\n3️⃣  Testing MCP Endpoint With Token...');
    try {
      const withAuth = await makeRequest('POST', '/mcp', {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/list',
        params: {}
      }, {
        'Authorization': `Bearer ${MCP_TOKEN}`
      });
      
      if (withAuth.status === 200 && withAuth.body.result) {
        console.log('   ✅ Authentication: PASS');
        console.log('   ✅ Tools List: SUCCESS\n');
        
        const tools = withAuth.body.result.tools || [];
        console.log(`   📋 Found ${tools.length} tools:\n`);
        
        tools.forEach((tool, index) => {
          console.log(`   ${index + 1}. ${tool.name}`);
          console.log(`      Description: ${tool.description || 'No description'}`);
          if (tool.inputSchema && tool.inputSchema.properties) {
            const params = Object.keys(tool.inputSchema.properties);
            if (params.length > 0) {
              console.log(`      Parameters: ${params.join(', ')}`);
            }
          }
          console.log('');
        });
      } else if (withAuth.status === 401) {
        console.log('   ❌ Authentication: FAIL');
        console.log('   Error:', withAuth.body.error?.message || 'Token verification failed');
        console.log('   ⚠️  Token may be invalid or external API is not reachable');
      } else {
        console.log('   ⚠️  Unexpected response:', withAuth.status);
        console.log('   Body:', JSON.stringify(withAuth.body, null, 2));
      }
    } catch (error) {
      console.log('   ❌ Request failed:', error.message);
    }
  } else {
    console.log('\n3️⃣  Skipping authenticated test (MCP_TOKEN not set)');
    console.log('   💡 Set MCP_TOKEN environment variable to test with authentication');
    console.log('   Example: MCP_TOKEN=your-token-here node test-mcp-with-auth.js');
  }

  // Test 4: Initialize Request (if token provided)
  if (MCP_TOKEN) {
    console.log('\n4️⃣  Testing MCP Initialize...');
    try {
      const init = await makeRequest('POST', '/mcp', {
        jsonrpc: '2.0',
        id: 3,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: {
            name: 'test-client',
            version: '1.0.0'
          }
        }
      }, {
        'Authorization': `Bearer ${MCP_TOKEN}`,
        'mcp-protocol-version': '2024-11-05'
      });
      
      if (init.status === 200) {
        console.log('   ✅ Initialize: PASS');
        console.log('   Server:', init.body.result?.serverInfo?.name || 'Unknown');
        console.log('   Protocol Version:', init.body.result?.protocolVersion || 'Unknown');
      } else {
        console.log('   ❌ Initialize: FAIL');
        console.log('   Status:', init.status);
        console.log('   Error:', init.body.error?.message || 'Unknown error');
      }
    } catch (error) {
      console.log('   ❌ Initialize failed:', error.message);
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('✅ Testing Complete!\n');
  
  if (!MCP_TOKEN) {
    console.log('💡 To test with authentication:');
    console.log('   1. Get a valid token from your external API');
    console.log('   2. Run: MCP_TOKEN=your-token node test-mcp-with-auth.js');
    console.log('   3. Or add it to your .env file and load it\n');
  }
}

testServer().catch(console.error);




