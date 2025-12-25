import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { MCPServer } from '../server.js';

export async function startStdioTransport(mcpServer: MCPServer) {
  const transport = new StdioServerTransport();

  console.error('[MCP Server] Starting with stdio transport...');

  await mcpServer.connect(transport);

  console.error('[MCP Server] Connected and ready to receive requests on stdio');
}
