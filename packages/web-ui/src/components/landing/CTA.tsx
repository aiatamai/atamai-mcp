'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function CTA() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-transparent to-pink-600/20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/30 rounded-full filter blur-3xl opacity-20 animate-pulse-glow" />
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="rounded-lg border border-purple-600/30 bg-purple-600/5 backdrop-blur-sm p-12 text-center">
          <h2 className="heading-lg text-white mb-4">Ready to Level Up Your Coding?</h2>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of developers using Context7 to find the right code patterns and APIs.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/signup"
              className="px-8 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-lg hover:shadow-purple-600/50 transition-all duration-200 flex items-center justify-center gap-2"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/docs"
              className="px-8 py-3 rounded-lg border border-purple-600 text-white font-semibold hover:bg-purple-600/10 transition-all duration-200"
            >
              Read Docs
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
