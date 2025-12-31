#!/usr/bin/env node

/**
 * List all available MCP tools
 * Tests the server and displays all registered tools
 */

import http from 'http';

const BASE_URL = 'http://localhost:3111';
const MCP_TOKEN = process.env.MCP_TOKEN || '';

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

async function listTools() {
  console.log('🔧 Demo MCP Server - Tools Listing\n');
  console.log('='.repeat(70));

  // Test health endpoint first
  console.log('\n📡 Checking server status...');
  try {
    const health = await makeRequest('GET', '/health');
    if (health.status === 200) {
      console.log('   ✅ Server is running');
      console.log('   Server:', health.body.server.name, health.body.server.version);
    } else {
      console.log('   ⚠️  Server responded with status:', health.status);
    }
  } catch (error) {
    console.log('   ❌ Server is not running or not accessible');
    console.log('   Error:', error.message);
    console.log('\n💡 Please start the server with: npm run dev\n');
    process.exit(1);
  }

  // List tools with authentication
  console.log('\n📋 Listing MCP Tools...\n');
  
  if (!MCP_TOKEN) {
    console.log('   ⚠️  No MCP_TOKEN provided - testing without authentication...\n');
  }

  try {
    const authHeaders = MCP_TOKEN ? { 'Authorization': `Bearer ${MCP_TOKEN}` } : {};
    
    const response = await makeRequest('POST', '/mcp', {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/list',
      params: {}
    }, authHeaders);

    if (response.status === 401) {
      console.log('   ❌ Authentication required');
      console.log('   Error:', response.body.error?.message || 'Unauthorized');
      console.log('\n💡 To list tools with authentication:');
      console.log('   MCP_TOKEN=your-token node list-tools.js\n');
      return;
    }

    if (response.status === 200 && response.body.result) {
      const tools = response.body.result.tools || [];
      
      console.log(`   ✅ Found ${tools.length} tools:\n`);
      console.log('='.repeat(70));
      
      // Group tools by category
      const coreTools = [];
      const aiTools = [];
      const externalApiTools = [];
      const authTools = [];

      tools.forEach(tool => {
        const name = tool.name;
        if (name === 'getAIModelInfo' || name === 'listAIModels') {
          coreTools.push(tool);
        } else if (name.includes('generate') || name.includes('analyze') || name.includes('Code')) {
          aiTools.push(tool);
        } else if (name.includes('Snippet') || name.includes('Project') || name.includes('Collection') || name.includes('External')) {
          externalApiTools.push(tool);
        } else if (name.includes('Token') || name.includes('Auth')) {
          authTools.push(tool);
        } else {
          coreTools.push(tool);
        }
      });

      // Display Core Tools
      if (coreTools.length > 0) {
        console.log('\n📌 CORE TOOLS\n');
        coreTools.forEach((tool, index) => {
          console.log(`   ${index + 1}. ${tool.name}`);
          console.log(`      ${tool.description || 'No description'}`);
          if (tool.inputSchema?.properties) {
            const params = Object.keys(tool.inputSchema.properties);
            if (params.length > 0) {
              console.log(`      Parameters: ${params.map(p => {
                const prop = tool.inputSchema.properties[p];
                return `${p}${prop.required ? '' : '?'} (${prop.type || 'any'})`;
              }).join(', ')}`);
            }
          }
          console.log('');
        });
      }

      // Display AI Tools
      if (aiTools.length > 0) {
        console.log('\n🤖 AI TOOLS\n');
        aiTools.forEach((tool, index) => {
          console.log(`   ${index + 1}. ${tool.name}`);
          console.log(`      ${tool.description || 'No description'}`);
          if (tool.inputSchema?.properties) {
            const params = Object.keys(tool.inputSchema.properties);
            if (params.length > 0) {
              console.log(`      Parameters: ${params.map(p => {
                const prop = tool.inputSchema.properties[p];
                return `${p}${prop.required ? '' : '?'} (${prop.type || 'any'})`;
              }).join(', ')}`);
            }
          }
          console.log('');
        });
      }

      // Display External API Tools
      if (externalApiTools.length > 0) {
        console.log('\n🌐 EXTERNAL API TOOLS\n');
        externalApiTools.forEach((tool, index) => {
          console.log(`   ${index + 1}. ${tool.name}`);
          console.log(`      ${tool.description || 'No description'}`);
          if (tool.inputSchema?.properties) {
            const params = Object.keys(tool.inputSchema.properties);
            if (params.length > 0) {
              console.log(`      Parameters: ${params.map(p => {
                const prop = tool.inputSchema.properties[p];
                return `${p}${prop.required ? '' : '?'} (${prop.type || 'any'})`;
              }).join(', ')}`);
            }
          }
          console.log('');
        });
      }

      // Display Auth Tools
      if (authTools.length > 0) {
        console.log('\n🔐 AUTHENTICATION TOOLS\n');
        authTools.forEach((tool, index) => {
          console.log(`   ${index + 1}. ${tool.name}`);
          console.log(`      ${tool.description || 'No description'}`);
          if (tool.inputSchema?.properties) {
            const params = Object.keys(tool.inputSchema.properties);
            if (params.length > 0) {
              console.log(`      Parameters: ${params.map(p => {
                const prop = tool.inputSchema.properties[p];
                return `${p}${prop.required ? '' : '?'} (${prop.type || 'any'})`;
              }).join(', ')}`);
            }
          }
          console.log('');
        });
      }

      console.log('='.repeat(70));
      console.log(`\n✅ Total: ${tools.length} tools available\n`);
      
    } else {
      console.log('   ❌ Failed to list tools');
      console.log('   Status:', response.status);
      console.log('   Response:', JSON.stringify(response.body, null, 2));
    }
  } catch (error) {
    console.log('   ❌ Error listing tools:', error.message);
  }
}

listTools().catch(console.error);




