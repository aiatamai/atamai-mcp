import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ApiClient } from '../api-client.js';
import { ResolveLibraryResponse } from '../types.js';

export class ResolveLibraryIdTool {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  getTool(): Tool {
    return {
      name: 'resolve-library-id',
      description:
        'Convert a library name to a Context7-compatible ID. Searches for the library in the database and returns matching results with ratings.',
      inputSchema: {
        type: 'object' as const,
        properties: {
          libraryName: {
            type: 'string',
            description: 'The name of the library to search for (e.g., "react", "next.js", "langchain")',
          },
        },
        required: ['libraryName'],
      },
    };
  }

  async handle(libraryName: string): Promise<ResolveLibraryResponse> {
    try {
      // Search for the library
      const searchResult = await this.apiClient.searchLibraries(libraryName);
      const libraries = searchResult.data || [];

      if (libraries.length === 0) {
        throw new Error(`No libraries found matching "${libraryName}"`);
      }

      // Format results
      const formattedLibraries = libraries.map((lib: any) => ({
        id: `/${lib.full_name}`,
        name: lib.name,
        description: lib.description,
        ecosystem: lib.ecosystem,
        stars: lib.stars,
        benchmarkScore: lib.benchmark_score,
        reputation: lib.reputation,
        codeSnippets: lib.documentation_pages?.length || 0,
      }));

      // Select the best match
      const selected = formattedLibraries[0];

      // Generate reasoning
      let reasoning = 'Exact name match';
      if (selected.benchmarkScore > 90) {
        reasoning += ' with highest benchmark score';
      } else if (selected.stars > 50000) {
        reasoning += ' with highest number of stars';
      } else if (selected.reputation === 'high') {
        reasoning += ' with high reputation';
      }

      return {
        libraries: formattedLibraries,
        selected: selected.id,
        reasoning,
      };
    } catch (error: any) {
      throw new Error(`Failed to resolve library: ${error.message}`);
    }
  }
}
