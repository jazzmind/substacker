'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, RefreshCw, Calendar, Target, TrendingUp, Megaphone } from 'lucide-react';
import type { Strategy } from '@/lib/types';

export default function StrategyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [stackName, setStackName] = useState('');

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    try {
      const [stratRes, stackRes] = await Promise.all([
        fetch(`/api/stacks/${id}/strategy`),
        fetch(`/api/stacks/${id}`),
      ]);
      if (stratRes.ok) {
        setStrategy(await stratRes.json());
      }
      if (stackRes.ok) {
        const stack = await stackRes.json();
        setStackName(stack.name);
      }
    } catch (err) {
      console.error('Failed to load strategy:', err);
    } finally {
      setLoading(false);
    }
  }

  async function generateStrategy() {
    setGenerating(true);
    try {
      const res = await fetch(`/api/stacks/${id}/strategy`, { method: 'POST' });
      if (res.ok) {
        await loadData();
      }
    } catch (err) {
      console.error('Failed to generate strategy:', err);
    } finally {
      setGenerating(false);
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
      <Link href={`/stacks/${id}`} className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to {stackName || 'Stack'}
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Posting Strategy</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            AI-generated content strategy based on expert profile and competitor analysis.
          </p>
        </div>
        <button
          onClick={generateStrategy}
          disabled={generating}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          {generating ? 'Generating...' : strategy ? 'Regenerate' : 'Generate Strategy'}
        </button>
      </div>

      {!strategy ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <Target className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No strategy yet</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Complete expert onboarding and competitor research first, then generate your strategy.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Posting Schedule */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Posting Schedule</h2>
            </div>
            <p className="text-gray-700 dark:text-gray-300">{strategy.postingSchedule || 'Not defined'}</p>
          </div>

          {/* Content Pillars */}
          {strategy.contentPillars?.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Content Pillars</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {strategy.contentPillars.map((pillar, i) => (
                  <div key={i} className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-gray-700 dark:text-gray-300">
                    {pillar}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Topic Calendar */}
          {strategy.topicCalendar?.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Topic Calendar</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-2 px-3 text-gray-600 dark:text-gray-400">Week</th>
                      <th className="text-left py-2 px-3 text-gray-600 dark:text-gray-400">Topic</th>
                      <th className="text-left py-2 px-3 text-gray-600 dark:text-gray-400">Angle</th>
                      <th className="text-left py-2 px-3 text-gray-600 dark:text-gray-400">Format</th>
                    </tr>
                  </thead>
                  <tbody>
                    {strategy.topicCalendar.map((entry, i) => (
                      <tr key={i} className="border-b border-gray-100 dark:border-gray-700/50">
                        <td className="py-2 px-3 text-gray-900 dark:text-white font-medium">{entry.week}</td>
                        <td className="py-2 px-3 text-gray-700 dark:text-gray-300">{entry.topic}</td>
                        <td className="py-2 px-3 text-gray-600 dark:text-gray-400">{entry.angle}</td>
                        <td className="py-2 px-3">
                          <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded">
                            {entry.format}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Growth Tactics */}
          {strategy.growthTactics?.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-orange-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Growth Tactics</h2>
              </div>
              <ul className="space-y-2">
                {strategy.growthTactics.map((tactic, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                    <span className="text-orange-600 mt-1">&#8226;</span>
                    {tactic}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tone Guidelines */}
          {strategy.toneGuidelines && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <Megaphone className="w-5 h-5 text-red-600" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Tone Guidelines</h2>
              </div>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{strategy.toneGuidelines}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
