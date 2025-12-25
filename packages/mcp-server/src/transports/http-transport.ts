import express, { Express } from 'express';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { MCPServer } from '../server.js';

export async function startHttpTransport(
  mcpServer: MCPServer,
  port: number = 3000,
): Promise<Express> {
  const app = express();

  app.use(express.json());

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.json({ status: 'healthy' });
  });

  // MCP SSE endpoint
  app.get('/mcp/sse', async (req, res) => {
    console.error('[MCP Server] Received SSE connection');

    const transport = new SSEServerTransport('/mcp/messages', res);

    try {
      await mcpServer.connect(transport);
    } catch (error) {
      console.error('[MCP Server] Error in SSE connection:', error);
      res.status(500).json({ error: 'Failed to establish SSE connection' });
    }
  });

  // MCP message endpoint (for HTTP POST requests)
  app.post('/mcp/messages', express.json(), async (req, res) => {
    try {
      // This would handle direct HTTP requests if needed
      // For now, SSE is the primary transport
      res.json({ message: 'Use /mcp/sse for MCP protocol' });
    } catch (error) {
      console.error('[MCP Server] Error processing message:', error);
      res.status(500).json({ error: 'Failed to process request' });
    }
  });

  app.listen(port, () => {
    console.error(`[MCP Server] HTTP transport listening on port ${port}`);
    console.error(`[MCP Server] SSE endpoint: http://localhost:${port}/mcp/sse`);
    console.error(`[MCP Server] Health check: http://localhost:${port}/health`);
  });

  return app;
}
