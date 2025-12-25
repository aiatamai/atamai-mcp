'use client';

import Link from 'next/link';
import { Check } from 'lucide-react';

interface PricingPlan {
  name: string;
  description: string;
  price: string | null;
  period: string;
  cta: string;
  highlight: boolean;
  features: string[];
}

const plans: PricingPlan[] = [
  {
    name: 'Free',
    description: 'Perfect for getting started',
    price: '$0',
    period: 'forever',
    cta: 'Get Started',
    highlight: false,
    features: [
      '50 API requests/minute',
      '1,000 requests/day',
      'Access to 100+ libraries',
      'Community support',
      'Standard rate limits',
    ],
  },
  {
    name: 'Pro',
    description: 'For active developers',
    price: '$19',
    period: 'per month',
    cta: 'Start Free Trial',
    highlight: true,
    features: [
      '500 API requests/minute',
      '50,000 requests/day',
      'Priority library updates',
      'Email support',
      'Custom integrations',
      'Usage analytics',
      'Webhook notifications',
    ],
  },
  {
    name: 'Enterprise',
    description: 'For teams and organizations',
    price: null,
    period: 'custom',
    cta: 'Contact Sales',
    highlight: false,
    features: [
      '5,000 API requests/minute',
      '1M+ requests/day',
      'Dedicated support',
      'Custom documentation crawls',
      'Advanced analytics',
      'SLA guarantees',
      'Self-hosted option',
    ],
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="heading-lg text-white mb-4">Simple, Transparent Pricing</h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Choose the plan that works for you. No hidden fees, cancel anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`relative rounded-lg transition-all duration-300 ${
                plan.highlight
                  ? 'md:scale-105 border-2 border-purple-600 bg-gradient-to-br from-purple-600/10 to-pink-600/10'
                  : 'border border-gray-800 bg-gray-900/50'
              } p-8 backdrop-blur-sm hover:border-purple-600/50`}
            >
              {/* Highlight Badge */}
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold">
                  Most Popular
                </div>
              )}

              {/* Plan Header */}
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-gray-400 text-sm">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="mb-6">
                {plan.price ? (
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-gray-400">/{plan.period}</span>
                  </div>
                ) : (
                  <div className="text-2xl font-bold text-white">Custom pricing</div>
                )}
              </div>

              {/* CTA Button */}
              <Link
                href={plan.name === 'Enterprise' ? '/contact' : '/signup'}
                className={`w-full block text-center py-2 rounded-lg font-semibold transition-all duration-200 mb-8 ${
                  plan.highlight
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-600/50'
                    : 'border border-purple-600 text-white hover:bg-purple-600/10'
                }`}
              >
                {plan.cta}
              </Link>

              {/* Features List */}
              <div className="space-y-4">
                {plan.features.map((feature, featureIdx) => (
                  <div key={featureIdx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* FAQ CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-400 mb-4">
            Have questions? Check out our{' '}
            <Link href="/faq" className="text-purple-400 hover:text-purple-300 transition-colors">
              frequently asked questions
            </Link>{' '}
            or{' '}
            <Link href="/contact" className="text-purple-400 hover:text-purple-300 transition-colors">
              contact us
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
