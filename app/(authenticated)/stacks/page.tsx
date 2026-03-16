'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Loader2, ExternalLink } from 'lucide-react';
import type { Stack } from '@/lib/types';

export default function StacksPage() {
  const router = useRouter();
  const [stacks, setStacks] = useState<Stack[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', substackUrl: '', expertName: '', expertBio: '', topics: '' });

  useEffect(() => {
    loadStacks();
  }, []);

  async function loadStacks() {
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

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch('/api/stacks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          substackUrl: form.substackUrl,
          expertName: form.expertName,
          expertBio: form.expertBio,
          topics: form.topics.split(',').map((t) => t.trim()).filter(Boolean),
        }),
      });
      if (res.ok) {
        const stack = await res.json();
        router.push(`/stacks/${stack.id}/onboard`);
      }
    } catch (err) {
      console.error('Failed to create stack:', err);
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Stacks</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Stack
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create New Stack</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Publication Name *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="My Tech Newsletter"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Substack URL *
              </label>
              <input
                type="url"
                required
                value={form.substackUrl}
                onChange={(e) => setForm({ ...form, substackUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="https://mytech.substack.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Expert Name *
              </label>
              <input
                type="text"
                required
                value={form.expertName}
                onChange={(e) => setForm({ ...form, expertName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Jane Smith"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Topics (comma-separated)
              </label>
              <input
                type="text"
                value={form.topics}
                onChange={(e) => setForm({ ...form, topics: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="AI, Machine Learning, Tech"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Expert Bio
            </label>
            <textarea
              value={form.expertBio}
              onChange={(e) => setForm({ ...form, expertBio: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Brief bio about the expert..."
            />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={creating} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {creating ? 'Creating...' : 'Create & Start Onboarding'}
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {stacks.map((stack) => (
          <Link
            key={stack.id}
            href={`/stacks/${stack.id}`}
            className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{stack.name}</h3>
                <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                  stack.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                  : stack.status === 'onboarding' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {stack.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {stack.expertName} &middot; {stack.subscriberCount || 0} subscribers
              </p>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-400" />
          </Link>
        ))}
        {stacks.length === 0 && (
          <p className="text-center py-12 text-gray-500 dark:text-gray-400">
            No stacks created yet. Click &quot;New Stack&quot; to get started.
          </p>
        )}
      </div>
    </div>
  );
}
