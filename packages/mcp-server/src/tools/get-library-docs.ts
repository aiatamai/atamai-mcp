import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ApiClient } from '../api-client.js';
import { GetDocsResponse } from '../types.js';

export class GetLibraryDocsTool {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  getTool(): Tool {
    return {
      name: 'get-library-docs',
      description:
        'Retrieve version-specific documentation and code examples for a library. Supports topic filtering, pagination, and different content modes.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          context7CompatibleLibraryID: {
            type: 'string',
            description:
              'The library ID in Context7 format (e.g., "/facebook/react" or "/facebook/react/18.2.0"). Use resolve-library-id tool first to get the ID.',
          },
          topic: {
            type: 'string',
            description:
              'Optional: Specific topic or API to focus documentation on (e.g., "hooks", "routing", "state management")',
          },
          page: {
            type: 'integer',
            description: 'Page number for pagination (1-10). Defaults to 1.',
            minimum: 1,
            maximum: 10,
          },
          mode: {
            type: 'string',
            enum: ['code', 'info'],
            description: 'Content mode: "code" for API references and examples, "info" for guides and conceptual documentation. Defaults to "code".',
          },
        },
        required: ['context7CompatibleLibraryID'],
      },
    };
  }

  async handle(
    libraryId: string,
    topic?: string,
    page: number = 1,
    mode: 'code' | 'info' = 'code',
  ): Promise<GetDocsResponse> {
    try {
      // Validate library ID format
      if (!libraryId.startsWith('/')) {
        throw new Error('Invalid library ID format. Must start with "/" (e.g., "/facebook/react")');
      }

      // Get documentation from backend
      const response = await this.apiClient.getDocumentation(libraryId, topic, page, mode);

      if (!response || !response.documentation) {
        throw new Error(`No documentation found for library "${libraryId}"`);
      }

      // Format response
      return {
        libraryId,
        library: response.library,
        version: response.version,
        topic: topic,
        page,
        totalPages: response.totalPages,
        documentation: (response.documentation || []).map((doc: any) => ({
          title: doc.title,
          type: doc.type || 'reference',
          content: doc.content,
          codeExamples: (doc.codeExamples || []).map((example: any) => ({
            language: example.language,
            code: example.code,
            description: example.description,
          })),
          url: doc.source_url,
        })),
      };
    } catch (error: any) {
      throw new Error(`Failed to get documentation: ${error.message}`);
    }
  }
}
