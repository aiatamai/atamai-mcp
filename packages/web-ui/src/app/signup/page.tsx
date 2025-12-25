'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function SignUpPage() {
  const router = useRouter();
  const { register, isLoading, error } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setValidationError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.email) {
      setValidationError('Email is required');
      return;
    }
    if (!formData.email.includes('@')) {
      setValidationError('Please enter a valid email');
      return;
    }
    if (!formData.password) {
      setValidationError('Password is required');
      return;
    }
    if (formData.password.length < 8) {
      setValidationError('Password must be at least 8 characters');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    // Submit
    const success = await register(formData.email, formData.password);
    if (success) {
      router.push('/dashboard');
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-purple-900/10 to-black flex items-center justify-center px-4 pt-20">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">C7</span>
            </div>
            <span className="text-xl font-bold text-white">Context7</span>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-gray-400">
            Join thousands of developers discovering code documentation
          </p>
        </div>

        {/* Form Card */}
        <div className="card mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-900/50 border border-gray-800 text-white placeholder-gray-500 focus:outline-none focus:border-purple-600 transition-colors"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 8 characters"
                  className="w-full pl-10 pr-12 py-2 rounded-lg bg-gray-900/50 border border-gray-800 text-white placeholder-gray-500 focus:outline-none focus:border-purple-600 transition-colors"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-900/50 border border-gray-800 text-white placeholder-gray-500 focus:outline-none focus:border-purple-600 transition-colors"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Error Messages */}
            {(validationError || error) && (
              <div className="p-3 rounded-lg bg-red-600/20 border border-red-600/50">
                <p className="text-sm text-red-300">{validationError || error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-lg hover:shadow-purple-600/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
              <ArrowRight className="w-5 h-5" />
            </button>

            {/* Terms */}
            <p className="text-xs text-gray-500 text-center">
              By signing up, you agree to our{' '}
              <Link href="/terms" className="text-purple-400 hover:text-purple-300">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-purple-400 hover:text-purple-300">
                Privacy Policy
              </Link>
            </p>
          </form>
        </div>

        {/* Sign In Link */}
        <div className="text-center">
          <p className="text-gray-400">
            Already have an account?{' '}
            <Link href="/signin" className="text-purple-400 hover:text-purple-300 font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
