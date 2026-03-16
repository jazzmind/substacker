'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { InterviewStudio } from '@/components/interview/InterviewStudio';

export default function OnboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [agentToken, setAgentToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [stackName, setStackName] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [tokenRes, stackRes] = await Promise.all([
          fetch('/api/auth/token'),
          fetch(`/api/stacks/${id}`),
        ]);
        if (tokenRes.ok) {
          const data = await tokenRes.json();
          setAgentToken(data.token);
        }
        if (stackRes.ok) {
          const stack = await stackRes.json();
          setStackName(stack.name);
        }
      } catch (err) {
        console.error('Failed to load:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const handleTranscriptUpdate = async (transcript: { role: string; text: string }[]) => {
    if (transcript.length > 0 && transcript.length % 5 === 0) {
      const fullTranscript = transcript
        .map((e) => `[${e.role === 'interviewer' ? 'AI' : 'Expert'}] ${e.text}`)
        .join('\n\n');

      try {
        // Save the transcript periodically
        await fetch(`/api/stacks/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'onboarding' }),
        });
      } catch {
        // Non-critical
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href={`/stacks/${id}`} className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to {stackName || 'Stack'}
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Expert Onboarding</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          The AI interviewer will learn about the expert&apos;s domain, style, and audience to build a content profile.
        </p>
      </div>

      {saved && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2 text-green-700 dark:text-green-300">
          <CheckCircle className="w-5 h-5" />
          Expert profile saved
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 h-[600px]">
        {agentToken ? (
          <InterviewStudio
            stackId={id}
            interviewId="onboarding"
            agentToken={agentToken}
            agentId="expert-interviewer"
            onTranscriptUpdate={handleTranscriptUpdate}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Failed to get agent token. Please refresh.
          </div>
        )}
      </div>
    </div>
  );
}
