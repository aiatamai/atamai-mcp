'use client';

import Link from 'next/link';
import { ArrowRight, Zap, Search, Code, Shield, BarChart3, Github } from 'lucide-react';
import { Header } from '@components/landing/Header';
import { Hero } from '@components/landing/Hero';
import { Features } from '@components/landing/Features';
import { Pricing } from '@components/landing/Pricing';
import { CTA } from '@components/landing/CTA';
import { Footer } from '@components/landing/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-purple-900/10 to-black">
      <Header />
      <Hero />
      <Features />
      <Pricing />
      <CTA />
      <Footer />
    </main>
  );
}
