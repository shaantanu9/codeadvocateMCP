#!/usr/bin/env node

/**
 * Test MCP server and list all available tools using MCP protocol
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

async function listMcpTools() {
  console.log('🔧 Demo MCP Server - Listing Tools via MCP Protocol\n');
  console.log('='.repeat(70));

  // Check server health
  console.log('\n1️⃣  Checking server status...');
  try {
    const health = await makeRequest('GET', '/health');
    if (health.status === 200) {
      console.log('   ✅ Server is running');
    } else {
      console.log('   ⚠️  Server status:', health.status);
    }
  } catch (error) {
    console.log('   ❌ Server is not running');
    console.log('   Error:', error.message);
    console.log('\n💡 Please start the server with: npm run dev\n');
    process.exit(1);
  }

  // Initialize MCP connection
  console.log('\n2️⃣  Initializing MCP connection...');
  let sessionId = null;
  
  const authHeaders = MCP_TOKEN ? { 'Authorization': `Bearer ${MCP_TOKEN}` } : {};
  
  try {
    const initResponse = await makeRequest('POST', '/mcp', {
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: {
          name: 'mcp-tools-lister',
          version: '1.0.0'
        }
      }
    }, {
      ...authHeaders,
      'mcp-protocol-version': '2024-11-05'
    });

    if (initResponse.status === 401) {
      console.log('   ❌ Authentication required');
      console.log('   Error:', initResponse.body.error?.message || 'Unauthorized');
      console.log('\n💡 To test with authentication:');
      console.log('   MCP_TOKEN=your-token node test-list-tools.js\n');
      return;
    }

    if (initResponse.status === 200 && initResponse.body.result) {
      console.log('   ✅ MCP initialized successfully');
      sessionId = initResponse.headers['mcp-session-id'];
      if (sessionId) {
        console.log('   Session ID:', sessionId);
      }
      console.log('   Server:', initResponse.body.result.serverInfo?.name || 'Unknown');
      console.log('   Protocol Version:', initResponse.body.result.protocolVersion || 'Unknown');
    } else {
      console.log('   ⚠️  Initialize response:', initResponse.status);
      console.log('   Body:', JSON.stringify(initResponse.body, null, 2));
    }
  } catch (error) {
    console.log('   ❌ Initialize failed:', error.message);
    return;
  }

  // List tools using MCP protocol
  console.log('\n3️⃣  Listing tools via MCP protocol (tools/list)...');
  
  try {
    const toolsResponse = await makeRequest('POST', '/mcp', {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list',
      params: {}
    }, {
      ...authHeaders,
      'mcp-protocol-version': '2024-11-05',
      ...(sessionId ? { 'mcp-session-id': sessionId } : {})
    });

    if (toolsResponse.status === 200 && toolsResponse.body.result) {
      const tools = toolsResponse.body.result.tools || [];
      
      console.log(`   ✅ Successfully retrieved ${tools.length} tools\n`);
      console.log('='.repeat(70));
      console.log('\n📋 AVAILABLE MCP TOOLS\n');
      console.log('='.repeat(70));

      // Display all tools
      tools.forEach((tool, index) => {
        console.log(`\n${index + 1}. ${tool.name}`);
        console.log(`   Description: ${tool.description || 'No description'}`);
        
        if (tool.inputSchema && tool.inputSchema.properties) {
          const properties = tool.inputSchema.properties;
          const required = tool.inputSchema.required || [];
          
          const paramList = Object.keys(properties).map(param => {
            const prop = properties[param];
            const isRequired = required.includes(param);
            const type = prop.type || 'any';
            const desc = prop.description || '';
            return `     - ${param}${isRequired ? ' (required)' : ' (optional)'}: ${type}${desc ? ` - ${desc}` : ''}`;
          });
          
          if (paramList.length > 0) {
            console.log('   Parameters:');
            paramList.forEach(p => console.log(p));
          }
        }
      });

      console.log('\n' + '='.repeat(70));
      console.log(`\n✅ Total: ${tools.length} tools available\n`);

      // Group summary
      const coreTools = tools.filter(t => ['getAIModelInfo', 'listAIModels'].includes(t.name));
      const aiTools = tools.filter(t => t.name.includes('generate') || t.name.includes('analyze') || t.name.includes('Code'));
      const externalTools = tools.filter(t => t.name.includes('Snippet') || t.name.includes('Project') || t.name.includes('Collection') || t.name.includes('External'));
      const authTools = tools.filter(t => t.name.includes('Token') || t.name.includes('Auth'));

      console.log('📊 Summary by Category:');
      console.log(`   Core Tools: ${coreTools.length}`);
      console.log(`   AI Tools: ${aiTools.length}`);
      console.log(`   External API Tools: ${externalTools.length}`);
      console.log(`   Auth Tools: ${authTools.length}`);
      console.log('');

    } else {
      console.log('   ❌ Failed to list tools');
      console.log('   Status:', toolsResponse.status);
      console.log('   Response:', JSON.stringify(toolsResponse.body, null, 2));
    }
  } catch (error) {
    console.log('   ❌ Error listing tools:', error.message);
  }
}

listMcpTools().catch(console.error);




