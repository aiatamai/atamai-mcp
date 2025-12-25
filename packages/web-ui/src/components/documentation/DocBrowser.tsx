'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, ExternalLink } from 'lucide-react';

interface DocBrowserProps {
  query: string;
  ecosystem: string | null;
}

interface Library {
  id: string;
  name: string;
  fullName: string;
  description: string;
  ecosystem: string;
  stars: number;
  url: string;
  version: string;
  docs: number;
}

// Mock data - will be replaced with API calls
const mockLibraries: Library[] = [
  {
    id: '/facebook/react',
    name: 'React',
    fullName: 'facebook/react',
    description: 'A JavaScript library for building user interfaces',
    ecosystem: 'javascript',
    stars: 220000,
    url: 'https://github.com/facebook/react',
    version: '18.2.0',
    docs: 245,
  },
  {
    id: '/vercel/next.js',
    name: 'Next.js',
    fullName: 'vercel/next.js',
    description: 'The React Framework for Production',
    ecosystem: 'javascript',
    stars: 125000,
    url: 'https://github.com/vercel/next.js',
    version: '14.0.3',
    docs: 389,
  },
  {
    id: '/vuejs/vue',
    name: 'Vue.js',
    fullName: 'vuejs/vue',
    description: 'Progressive JavaScript framework for building user interfaces',
    ecosystem: 'javascript',
    stars: 207000,
    url: 'https://github.com/vuejs/vue',
    version: '3.3.4',
    docs: 267,
  },
  {
    id: '/python/cpython',
    name: 'Python',
    fullName: 'python/cpython',
    description: 'The Python programming language interpreter',
    ecosystem: 'python',
    stars: 63000,
    url: 'https://github.com/python/cpython',
    version: '3.12.0',
    docs: 543,
  },
  {
    id: '/langchain-ai/langchain',
    name: 'LangChain',
    fullName: 'langchain-ai/langchain',
    description: 'Building applications with LLMs through composability',
    ecosystem: 'ai-ml',
    stars: 68000,
    url: 'https://github.com/langchain-ai/langchain',
    version: '0.1.0',
    docs: 156,
  },
];

export function DocBrowser({ query, ecosystem }: DocBrowserProps) {
  const [libraries, setLibraries] = useState<Library[]>(mockLibraries);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Simulate filtering based on query and ecosystem
    let filtered = mockLibraries;

    if (ecosystem) {
      filtered = filtered.filter((lib) => lib.ecosystem === ecosystem);
    }

    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter(
        (lib) =>
          lib.name.toLowerCase().includes(q) ||
          lib.description.toLowerCase().includes(q) ||
          lib.fullName.toLowerCase().includes(q)
      );
    }

    setLibraries(filtered);
  }, [query, ecosystem]);

  if (isLoading) {
    return <div className="text-center text-gray-400">Loading...</div>;
  }

  if (libraries.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg mb-4">No libraries found matching your criteria</p>
        <p className="text-gray-500">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-400 mb-4">
        Found {libraries.length} {libraries.length === 1 ? 'library' : 'libraries'}
      </div>

      {libraries.map((lib) => (
        <div
          key={lib.id}
          className="card-hover group p-6 cursor-pointer transition-all duration-200"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-white group-hover:text-purple-400 transition-colors">
                {lib.name}
              </h3>
              <p className="text-sm text-gray-400 mt-1">{lib.fullName}</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-600/20 text-purple-300 whitespace-nowrap ml-4">
              {lib.ecosystem}
            </span>
          </div>

          <p className="text-gray-300 mb-4">{lib.description}</p>

          <div className="flex items-center gap-6 mb-4 text-sm">
            <div className="flex items-center gap-2 text-gray-400">
              <Star className="w-4 h-4 text-yellow-400" />
              <span>{(lib.stars / 1000).toFixed(0)}k stars</span>
            </div>
            <div className="text-gray-400">
              v<span>{lib.version}</span>
            </div>
            <div className="text-gray-400">
              <span>{lib.docs}</span> docs
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              href={`/documentation/${lib.id}`}
              className="px-4 py-2 rounded-lg bg-purple-600/20 text-purple-300 text-sm font-medium hover:bg-purple-600 hover:text-white transition-colors"
            >
              View Docs
            </Link>
            <a
              href={lib.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg border border-gray-700 text-gray-300 text-sm font-medium hover:border-purple-600 hover:text-white transition-colors inline-flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              GitHub
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
