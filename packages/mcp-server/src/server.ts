import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { ApiClient } from './api-client.js';
import { ResolveLibraryIdTool } from './tools/resolve-library-id.js';
import { GetLibraryDocsTool } from './tools/get-library-docs.js';

export class MCPServer {
  private server: Server;
  private apiClient: ApiClient;
  private resolveLibraryIdTool: ResolveLibraryIdTool;
  private getLibraryDocsTool: GetLibraryDocsTool;

  constructor(backendUrl?: string) {
    this.apiClient = new ApiClient(backendUrl);
    this.resolveLibraryIdTool = new ResolveLibraryIdTool(this.apiClient);
    this.getLibraryDocsTool = new GetLibraryDocsTool(this.apiClient);

    this.server = new Server(
      {
        name: 'atamai-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      },
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools: Tool[] = [
        this.resolveLibraryIdTool.getTool(),
        this.getLibraryDocsTool.getTool(),
      ];

      return { tools };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        if (name === 'resolve-library-id') {
          const libraryName = args.libraryName as string;
          if (!libraryName) {
            throw new Error('Missing required argument: libraryName');
          }

          const result = await this.resolveLibraryIdTool.handle(libraryName);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        } else if (name === 'get-library-docs') {
          const libraryId = args.context7CompatibleLibraryID as string;
          if (!libraryId) {
            throw new Error('Missing required argument: context7CompatibleLibraryID');
          }

          const topic = args.topic as string | undefined;
          const page = args.page ? parseInt(String(args.page), 10) : 1;
          const mode = (args.mode as 'code' | 'info') || 'code';

          const result = await this.getLibraryDocsTool.handle(libraryId, topic, page, mode);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        } else {
          throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
              isError: true,
            },
          ],
        };
      }
    });
  }

  getServer(): Server {
    return this.server;
  }

  async connect(transport: any) {
    await this.server.connect(transport);
  }
}
