'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, Key, Copy, Trash2, Plus, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useApiKeys } from '@/hooks/useApiKeys';
import { ApiKeyModal } from '@/components/dashboard/ApiKeyModal';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const { keys, isLoading, error, fetchKeys, generateKey, revokeKey } = useApiKeys();
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/signin');
    }
  }, [isAuthenticated, authLoading, router]);

  // Fetch API keys on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchKeys();
    }
  }, [isAuthenticated, fetchKeys]);

  const toggleKeyVisibility = (keyId: string) => {
    setVisibleKeys((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(keyId)) {
        newSet.delete(keyId);
      } else {
        newSet.add(keyId);
      }
      return newSet;
    });
  };

  const copyToClipboard = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(keyId);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleKeyGenerated = async () => {
    setShowNewKeyModal(false);
    await fetchKeys();
  };

  if (authLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-black via-purple-900/10 to-black flex items-center justify-center pt-20">
        <div className="text-gray-400">Loading...</div>
      </main>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-purple-900/10 to-black pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-gray-400">Welcome back, {user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg border border-gray-800 text-white hover:border-purple-600 hover:text-purple-300 transition-colors flex items-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* User Info Card */}
            <div className="card mb-6">
              <h2 className="text-lg font-semibold text-white mb-4">Account</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Email</p>
                  <p className="text-white font-medium">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Plan</p>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-purple-600/20 text-purple-300 capitalize">
                      {user.tier}
                    </span>
                    {user.tier === 'free' && (
                      <Link
                        href="/pricing"
                        className="text-xs text-purple-400 hover:text-purple-300"
                      >
                        Upgrade
                      </Link>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Member Since</p>
                  <p className="text-white font-medium">
                    {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="card">
              <h2 className="text-lg font-semibold text-white mb-4">Quick Links</h2>
              <div className="space-y-2">
                <Link
                  href="/documentation"
                  className="block px-3 py-2 rounded-lg text-gray-300 hover:bg-purple-600/10 hover:text-white transition-colors"
                >
                  Browse Documentation
                </Link>
                <Link
                  href="/api-docs"
                  className="block px-3 py-2 rounded-lg text-gray-300 hover:bg-purple-600/10 hover:text-white transition-colors"
                >
                  API Documentation
                </Link>
                {user.tier !== 'free' && (
                  <Link
                    href="/admin"
                    className="block px-3 py-2 rounded-lg text-gray-300 hover:bg-purple-600/10 hover:text-white transition-colors"
                  >
                    Admin Panel
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* API Keys Section */}
            <div className="card">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Key className="w-5 h-5 text-purple-400" />
                  API Keys
                </h2>
                <button
                  onClick={() => setShowNewKeyModal(true)}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-lg hover:shadow-purple-600/50 transition-all duration-200 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Key
                </button>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-600/20 border border-red-600/50 mb-4">
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}

              {keys.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400 mb-4">No API keys yet</p>
                  <button
                    onClick={() => setShowNewKeyModal(true)}
                    className="text-purple-400 hover:text-purple-300 text-sm font-medium"
                  >
                    Create your first API key
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {keys.map((key) => (
                    <div
                      key={key.id}
                      className="p-4 rounded-lg border border-gray-800 bg-gray-900/30 hover:border-purple-600/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-white font-semibold">{key.name}</h3>
                          <p className="text-xs text-gray-500 mt-1">
                            Created {new Date(key.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="px-2 py-1 rounded text-xs font-semibold bg-green-600/20 text-green-300">
                          {key.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      {/* Key Preview */}
                      <div className="bg-black/30 rounded p-3 mb-4 font-mono text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">
                            {visibleKeys.has(key.id)
                              ? key.key_prefix + '_' + '•'.repeat(20)
                              : key.key_prefix + '_••••••••••••••••••••'}
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => toggleKeyVisibility(key.id)}
                              className="text-gray-500 hover:text-gray-300"
                            >
                              {visibleKeys.has(key.id) ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() =>
                                copyToClipboard(key.key_prefix + '_secret', key.id)
                              }
                              className="text-gray-500 hover:text-gray-300"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Rate Limit</p>
                          <p className="text-white font-medium">
                            {key.rate_limit_rpm} req/min
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs mb-1">Daily Limit</p>
                          <p className="text-white font-medium">
                            {key.rate_limit_rpd.toLocaleString()} req/day
                          </p>
                        </div>
                      </div>

                      {/* Revoke Button */}
                      <button
                        onClick={() => revokeKey(key.id)}
                        disabled={isLoading}
                        className="w-full px-3 py-2 rounded-lg border border-red-600/50 text-red-400 hover:bg-red-600/10 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        Revoke Key
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* API Key Modal */}
      {showNewKeyModal && (
        <ApiKeyModal
          isOpen={showNewKeyModal}
          onClose={() => setShowNewKeyModal(false)}
          onKeyGenerated={handleKeyGenerated}
          isLoading={isLoading}
        />
      )}
    </main>
  );
}
