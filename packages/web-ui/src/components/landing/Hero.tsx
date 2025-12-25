'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export function Hero() {
  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-glow" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-pink-500/30 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse-glow" />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-orange-500/20 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse-glow" />
      </div>

      <div className="max-w-4xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-purple-600/50 bg-purple-600/10 backdrop-blur-sm animate-fade-in-up">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-semibold text-purple-300">Powered by AI • Always Up-to-Date</span>
        </div>

        {/* Main Heading */}
        <h1 className="heading-xl text-gradient mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          Code Documentation that Actually Works
        </h1>

        {/* Subheading */}
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          Real-time, AI-indexed documentation for modern libraries. Get accurate code examples, API references, and guides updated daily.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <Link
            href="/signup"
            className="px-8 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-lg hover:shadow-purple-600/50 transition-all duration-200 flex items-center justify-center gap-2"
          >
            Start Free
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="#features"
            className="px-8 py-3 rounded-lg border border-purple-600 text-white font-semibold hover:bg-purple-600/10 transition-all duration-200"
          >
            Learn More
          </Link>
        </div>

        {/* Floating Card */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <div className="card max-w-md mx-auto">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-sm text-gray-400">Live Example</span>
            </div>
            <div className="bg-black/40 rounded p-4 font-mono text-sm text-gray-300">
              <div className="text-purple-400">$ npm install react</div>
              <div className="text-gray-500 mt-2">→ React v18.2.0 documentation</div>
              <div className="text-purple-400 mt-2">+28 docs found • 5.2MB of examples</div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-16 max-w-2xl mx-auto">
          {[
            { number: '100+', label: 'Libraries' },
            { number: '50K+', label: 'Examples' },
            { number: '<100ms', label: 'Latency' },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="animate-fade-in-up"
              style={{ animationDelay: `${0.5 + idx * 0.1}s` }}
            >
              <div className="text-2xl font-bold text-purple-400">{stat.number}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
