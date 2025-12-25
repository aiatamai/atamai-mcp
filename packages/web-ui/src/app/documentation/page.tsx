'use client';

import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { DocBrowser } from '@components/documentation/DocBrowser';

export default function DocumentationPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEcosystem, setSelectedEcosystem] = useState<string | null>(null);

  const ecosystems = [
    { id: 'javascript', label: 'JavaScript/TypeScript', count: 45 },
    { id: 'python', label: 'Python', count: 28 },
    { id: 'rust', label: 'Rust', count: 18 },
    { id: 'go', label: 'Go', count: 15 },
    { id: 'ai-ml', label: 'AI/ML', count: 22 },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-purple-900/10 to-black pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Documentation</h1>
          <p className="text-gray-400 text-lg">
            Explore curated documentation for 100+ popular libraries
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search libraries, APIs, or examples..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg bg-gray-900/50 border border-gray-800 text-white placeholder-gray-500 focus:outline-none focus:border-purple-600 transition-colors"
            />
          </div>
        </div>

        {/* Filters and Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 p-6 rounded-lg border border-gray-800 bg-gray-900/50 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-6">
                <Filter className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-semibold text-white">Filters</h2>
              </div>

              {/* Ecosystem Filter */}
              <div className="space-y-3">
                <button
                  onClick={() => setSelectedEcosystem(null)}
                  className={`w-full text-left px-3 py-2 rounded transition-colors ${
                    selectedEcosystem === null
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  All Ecosystems
                </button>
                {ecosystems.map((eco) => (
                  <button
                    key={eco.id}
                    onClick={() => setSelectedEcosystem(eco.id)}
                    className={`w-full text-left px-3 py-2 rounded transition-colors flex justify-between items-center ${
                      selectedEcosystem === eco.id
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <span>{eco.label}</span>
                    <span className="text-sm text-gray-500">{eco.count}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Documentation Browser */}
          <div className="lg:col-span-3">
            <DocBrowser query={searchQuery} ecosystem={selectedEcosystem} />
          </div>
        </div>
      </div>
    </main>
  );
}
