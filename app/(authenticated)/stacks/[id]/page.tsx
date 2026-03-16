'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Loader2, Users, Search, Target, Mic, FileText, BarChart3, ArrowLeft } from 'lucide-react';
import type { Stack, ExpertProfile, Strategy } from '@/lib/types';

export default function StackDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [stack, setStack] = useState<Stack | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/stacks/${id}`);
        if (res.ok) {
          setStack(await res.json());
        }
      } catch (err) {
        console.error('Failed to load stack:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!stack) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">Stack not found.</p>
        <Link href="/stacks" className="text-blue-600 hover:underline mt-2 inline-block">Back to Stacks</Link>
      </div>
    );
  }

  const sections = [
    { href: `/stacks/${id}/onboard`, icon: Users, label: 'Expert Onboarding', desc: 'Interview the expert to build their profile', color: 'text-purple-600' },
    { href: `/stacks/${id}/research`, icon: Search, label: 'Competitor Research', desc: 'Analyze competing Substacks', color: 'text-blue-600' },
    { href: `/stacks/${id}/strategy`, icon: Target, label: 'Posting Strategy', desc: 'AI-generated content strategy', color: 'text-green-600' },
    { href: `/stacks/${id}/interview`, icon: Mic, label: 'Interview Studio', desc: 'Conduct weekly expert interviews', color: 'text-orange-600' },
    { href: `/stacks/${id}/posts`, icon: FileText, label: 'Posts', desc: 'Manage and publish posts', color: 'text-red-600' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link href="/stacks" className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 mb-3">
          <ArrowLeft className="w-4 h-4" /> Back to Stacks
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{stack.name}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {stack.expertName} &middot;{' '}
              <a href={stack.substackUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                {stack.substackUrl}
              </a>
            </p>
          </div>
          <span className={`px-3 py-1 text-sm rounded-full font-medium ${
            stack.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
            : stack.status === 'onboarding' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
          }`}>
            {stack.status}
          </span>
        </div>
        {stack.topics?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {stack.topics.map((topic) => (
              <span key={topic} className="px-3 py-1 text-sm bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">
                {topic}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors group"
          >
            <section.icon className={`w-8 h-8 ${section.color} mb-3`} />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
              {section.label}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{section.desc}</p>
          </Link>
        ))}
      </div>

      {stack.expertBio && (
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">About {stack.expertName}</h2>
          <p className="text-gray-600 dark:text-gray-400">{stack.expertBio}</p>
        </div>
      )}
    </div>
  );
}
