'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/50 border-b border-purple-900/30">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">C7</span>
            </div>
            <span className="text-xl font-bold text-white hidden sm:inline">Context7</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-gray-300 hover:text-white transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-gray-300 hover:text-white transition-colors">
              Pricing
            </Link>
            <Link href="#docs" className="text-gray-300 hover:text-white transition-colors">
              Docs
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors"
            >
              GitHub
            </a>
          </div>

          {/* CTA Buttons */}
          <div className="hidden sm:flex items-center gap-4">
            <Link
              href="/signin"
              className="text-white hover:text-purple-300 transition-colors font-medium"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-lg hover:shadow-purple-600/50 transition-all duration-200"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? (
              <X className="w-6 h-6 text-white" />
            ) : (
              <Menu className="w-6 h-6 text-white" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden pb-4 border-t border-purple-900/30 mt-4 animate-slide-in-right">
            <div className="flex flex-col gap-4 pt-4">
              <Link
                href="#features"
                className="text-gray-300 hover:text-white transition-colors px-2"
              >
                Features
              </Link>
              <Link
                href="#pricing"
                className="text-gray-300 hover:text-white transition-colors px-2"
              >
                Pricing
              </Link>
              <Link
                href="/signin"
                className="text-white px-2 py-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-center"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
