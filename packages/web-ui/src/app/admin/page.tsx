'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart3, Database, Zap, Users, TrendingUp, Play } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';

interface AdminStats {
  totalLibraries: number;
  totalUsers: number;
  apiRequests: number;
  activeCrawls: number;
  crawlsCompleted: number;
  docsIndexed: number;
}

interface CrawlJob {
  id: string;
  libraryId: string;
  libraryName: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  pagesScraped: number;
  pagesIndexed: number;
  startedAt: string;
  completedAt?: string;
  error?: string;
}

export default function AdminPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [jobs, setJobs] = useState<CrawlJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check authorization
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !user || user.tier === 'free')) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, user, authLoading, router]);

  // Fetch admin data
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setIsLoading(true);
        const [statsRes, jobsRes] = await Promise.all([
          api.getStats(),
          api.getCrawlJobs(),
        ]);

        if (statsRes.data) {
          setStats(statsRes.data as AdminStats);
        }
        if (jobsRes.data) {
          setJobs(jobsRes.data as CrawlJob[]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load admin data');
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && user && user.tier !== 'free') {
      fetchAdminData();
      // Refresh every 10 seconds
      const interval = setInterval(fetchAdminData, 10000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user]);

  if (authLoading || isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-black via-purple-900/10 to-black flex items-center justify-center pt-20">
        <div className="text-gray-400">Loading...</div>
      </main>
    );
  }

  if (!isAuthenticated || !user || user.tier === 'free') {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-purple-900/10 to-black pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">Admin Panel</h1>
          <p className="text-gray-400">System monitoring and crawler management</p>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[
              {
                icon: Database,
                label: 'Libraries',
                value: stats.totalLibraries,
                color: 'purple',
              },
              {
                icon: Users,
                label: 'Users',
                value: stats.totalUsers,
                color: 'pink',
              },
              {
                icon: Zap,
                label: 'API Requests',
                value: stats.apiRequests.toLocaleString(),
                color: 'orange',
              },
              {
                icon: TrendingUp,
                label: 'Docs Indexed',
                value: stats.docsIndexed.toLocaleString(),
                color: 'green',
              },
              {
                icon: Play,
                label: 'Active Crawls',
                value: stats.activeCrawls,
                color: 'blue',
              },
              {
                icon: BarChart3,
                label: 'Completed',
                value: stats.crawlsCompleted,
                color: 'indigo',
              },
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="card">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-gray-400 text-sm mb-2">{stat.label}</p>
                      <p className="text-3xl font-bold text-white">{stat.value}</p>
                    </div>
                    <div
                      className={`p-3 rounded-lg bg-${stat.color}-600/20 text-${stat.color}-400`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 rounded-lg bg-red-600/20 border border-red-600/50 mb-8">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Crawl Jobs */}
        <div className="card">
          <h2 className="text-2xl font-bold text-white mb-6">Crawler Jobs</h2>

          {jobs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">No crawl jobs yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-3 px-4 font-semibold text-gray-300">
                      Library
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-300">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-300">
                      Progress
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-300">
                      Pages
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-300">
                      Started
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job.id} className="border-b border-gray-800/50 hover:bg-gray-900/30">
                      <td className="py-3 px-4 text-white">{job.libraryName}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            job.status === 'completed'
                              ? 'bg-green-600/20 text-green-300'
                              : job.status === 'running'
                              ? 'bg-blue-600/20 text-blue-300'
                              : job.status === 'failed'
                              ? 'bg-red-600/20 text-red-300'
                              : 'bg-gray-600/20 text-gray-300'
                          }`}
                        >
                          {job.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-300"
                              style={{ width: `${job.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-400">{job.progress}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-300 text-sm">
                        {job.pagesScraped}/{job.pagesIndexed}
                      </td>
                      <td className="py-3 px-4 text-gray-400 text-sm">
                        {new Date(job.startedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
