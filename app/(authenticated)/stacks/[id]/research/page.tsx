'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, RefreshCw, ExternalLink, Globe } from 'lucide-react';
import type { Competitor } from '@/lib/types';

export default function ResearchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [researching, setResearching] = useState(false);
  const [stackName, setStackName] = useState('');
  const [researchResult, setResearchResult] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    try {
      const [compRes, stackRes] = await Promise.all([
        fetch(`/api/stacks/${id}/research`),
        fetch(`/api/stacks/${id}`),
      ]);
      if (compRes.ok) {
        const data = await compRes.json();
        setCompetitors(data.competitors || []);
      }
      if (stackRes.ok) {
        const stack = await stackRes.json();
        setStackName(stack.name);
      }
    } catch (err) {
      console.error('Failed to load research:', err);
    } finally {
      setLoading(false);
    }
  }

  async function runResearch() {
    setResearching(true);
    setResearchResult(null);
    try {
      const res = await fetch(`/api/stacks/${id}/research`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setResearchResult(data.result || 'Research complete');
        await loadData();
      } else {
        const err = await res.json();
        setResearchResult(`Error: ${err.error}`);
      }
    } catch (err) {
      setResearchResult('Research failed. Please try again.');
    } finally {
      setResearching(false);
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Competitor Research</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            AI-powered analysis of competing Substacks in your niche.
          </p>
        </div>
        <button
          onClick={runResearch}
          disabled={researching}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {researching ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          {researching ? 'Researching...' : 'Run Research'}
        </button>
      </div>

      {researchResult && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{researchResult}</p>
        </div>
      )}

      {competitors.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <Globe className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No competitors analyzed yet</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Click &quot;Run Research&quot; to have the AI find and analyze competing Substacks.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {competitors.map((comp) => (
            <div key={comp.id} className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{comp.name}</h3>
                  <a href={comp.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                    {comp.url} <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                  <p>{comp.subscriberEstimate || 'Unknown'} subscribers</p>
                  <p>{comp.postingFrequency || 'Unknown'} frequency</p>
                </div>
              </div>
              {comp.topTopics?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {comp.topTopics.map((topic) => (
                    <span key={topic} className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded">
                      {topic}
                    </span>
                  ))}
                </div>
              )}
              {comp.successFactors && (
                <div className="mb-2">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Success Factors:</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{comp.successFactors}</p>
                </div>
              )}
              {comp.tone && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-medium">Tone:</span> {comp.tone}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
