'use client';

import { Zap, Search, Code, Shield, BarChart3, Wand2 } from 'lucide-react';

interface Feature {
  icon: typeof Zap;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'Sub-100ms response times. Get instant answers to your coding questions.',
  },
  {
    icon: Search,
    title: 'Semantic Search',
    description: 'Find exactly what you need with intelligent full-text search across all libraries.',
  },
  {
    icon: Code,
    title: 'Real Code Examples',
    description: 'Thousands of practical examples extracted directly from real repositories.',
  },
  {
    icon: Shield,
    title: 'Always Accurate',
    description: 'Documentation updated daily from official sources. Never outdated.',
  },
  {
    icon: BarChart3,
    title: 'Usage Analytics',
    description: 'Track API usage, quotas, and integrate with your existing tools.',
  },
  {
    icon: Wand2,
    title: 'AI-Powered',
    description: 'Powered by Claude. Works natively with Claude Desktop and Cursor.',
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="heading-lg text-white mb-4">Powerful Features</h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Everything you need to discover and learn from the best code documentation.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="card-hover group"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                {/* Icon */}
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center mb-4 group-hover:shadow-lg group-hover:shadow-purple-600/50 transition-all duration-200">
                  <Icon className="w-6 h-6 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>

        {/* Feature Highlight */}
        <div className="mt-16 p-8 rounded-lg border border-purple-600/30 bg-purple-600/5 backdrop-blur-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'MCP Protocol',
                description: 'Native integration with Claude Desktop and Cursor via Model Context Protocol.',
              },
              {
                title: 'REST API',
                description: 'Full-featured API with tiered rate limits for building integrations.',
              },
              {
                title: 'Source Control',
                description: 'Automatically crawls GitHub repositories and official documentation sites.',
              },
            ].map((item, idx) => (
              <div key={idx}>
                <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
