import { MCPServer } from './server.js';
import { startStdioTransport } from './transports/stdio-transport.js';
import { startHttpTransport } from './transports/http-transport.js';

const TRANSPORT_TYPE = process.env.MCP_TRANSPORT || 'stdio';
const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:5000';
const HTTP_PORT = parseInt(process.env.MCP_SERVER_PORT || '3000', 10);

async function main() {
  try {
    console.error('[MCP Server] Initializing Context7 MCP Server');
    console.error(`[MCP Server] Backend API URL: ${BACKEND_URL}`);
    console.error(`[MCP Server] Transport: ${TRANSPORT_TYPE}`);

    const mcpServer = new MCPServer(BACKEND_URL);

    if (TRANSPORT_TYPE === 'http') {
      await startHttpTransport(mcpServer, HTTP_PORT);
    } else {
      // Default to stdio
      await startStdioTransport(mcpServer);
    }
  } catch (error) {
    console.error('[MCP Server] Fatal error:', error);
    process.exit(1);
  }
}

main();
