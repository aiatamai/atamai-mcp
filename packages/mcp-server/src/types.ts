export interface LibraryMatch {
  id: string;
  name: string;
  description?: string;
  ecosystem: string;
  stars: number;
  benchmarkScore: number;
  reputation: 'high' | 'medium' | 'low';
  codeSnippets: number;
}

export interface ResolveLibraryResponse {
  libraries: LibraryMatch[];
  selected: string;
  reasoning: string;
}

export interface CodeExample {
  language: string;
  code: string;
  description: string;
}

export interface DocPage {
  title: string;
  type: 'api' | 'guide' | 'tutorial' | 'reference' | 'example';
  content: string;
  codeExamples: CodeExample[];
  url?: string;
}

export interface GetDocsResponse {
  libraryId: string;
  library: {
    name: string;
    full_name: string;
    ecosystem: string;
  };
  version: string;
  topic?: string;
  page: number;
  totalPages: number;
  documentation: DocPage[];
}

export interface RateLimitInfo {
  rpm: number;
  rpd: number;
}

export interface ApiKeyInfo {
  valid: boolean;
  userId?: string;
  tier?: 'free' | 'pro' | 'enterprise';
  rateLimits?: RateLimitInfo;
}
