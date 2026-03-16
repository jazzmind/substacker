'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Newspaper, TrendingUp, Mic, FileText, Plus, Loader2 } from 'lucide-react';
import type { Stack } from '@/lib/types';

export default function DashboardPage() {
  const [stacks, setStacks] = useState<Stack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/stacks');
        if (res.ok) {
          const data = await res.json();
          setStacks(data.stacks || []);
        }
      } catch (err) {
        console.error('Failed to load stacks:', err);
      } finally {
        setLoading(false);
      }
    }
    // Initialize documents
    fetch('/api/setup', { method: 'POST' }).then(() => load());
  }, []);

  const activeStacks = stacks.filter((s) => s.status === 'active');
  const totalSubscribers = stacks.reduce((sum, s) => sum + (s.subscriberCount || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Substacker</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and grow your expert-driven Substacks
          </p>
        </div>
        <Link
          href="/stacks"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Stack
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Newspaper className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stacks.length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Stacks</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeStacks.length}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Mic className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalSubscribers}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Subscribers</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-orange-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stacks.filter((s) => s.status === 'onboarding').length}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Onboarding</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stack Cards */}
      {stacks.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <Newspaper className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Substacks yet
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Create your first Substack to get started with expert interviews and content strategy.
          </p>
          <Link
            href="/stacks"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create First Stack
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stacks.map((stack) => (
            <Link
              key={stack.id}
              href={`/stacks/${stack.id}`}
              className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {stack.name}
                </h3>
                <span
                  className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                    stack.status === 'active'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      : stack.status === 'onboarding'
                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  {stack.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Expert: {stack.expertName}
              </p>
              {stack.topics?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {stack.topics.slice(0, 3).map((topic) => (
                    <span
                      key={topic}
                      className="px-2 py-0.5 text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded"
                    >
                      {topic}
                    </span>
                  ))}
                  {stack.topics.length > 3 && (
                    <span className="text-xs text-gray-500">+{stack.topics.length - 3} more</span>
                  )}
                </div>
              )}
              <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <span>{stack.subscriberCount || 0} subscribers</span>
                <span>{stack.postingFrequency || 'Not set'}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
