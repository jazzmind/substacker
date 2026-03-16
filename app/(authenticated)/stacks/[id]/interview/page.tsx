'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Plus, FileText, Wand2 } from 'lucide-react';
import { InterviewStudio } from '@/components/interview/InterviewStudio';
import type { Interview } from '@/lib/types';

export default function InterviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [activeInterview, setActiveInterview] = useState<Interview | null>(null);
  const [agentToken, setAgentToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [generatingScript, setGeneratingScript] = useState(false);
  const [stackName, setStackName] = useState('');

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    try {
      const [intRes, tokenRes, stackRes] = await Promise.all([
        fetch(`/api/interviews?stackId=${id}`),
        fetch('/api/auth/token'),
        fetch(`/api/stacks/${id}`),
      ]);
      if (intRes.ok) {
        const data = await intRes.json();
        setInterviews(data.interviews || []);
      }
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

  async function createInterview() {
    setCreating(true);
    try {
      const res = await fetch('/api/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stackId: id }),
      });
      if (res.ok) {
        const interview = await res.json();
        setActiveInterview(interview);
        await loadData();
      }
    } catch (err) {
      console.error('Failed to create interview:', err);
    } finally {
      setCreating(false);
    }
  }

  async function generateScript(interviewId: string) {
    setGeneratingScript(true);
    try {
      const res = await fetch(`/api/interviews/${interviewId}/script`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setActiveInterview((prev) => prev ? { ...prev, script: data.script } : prev);
        await loadData();
      }
    } catch (err) {
      console.error('Failed to generate script:', err);
    } finally {
      setGeneratingScript(false);
    }
  }

  async function handleTranscriptUpdate(transcript: { role: string; text: string }[]) {
    if (!activeInterview || transcript.length === 0) return;
    if (transcript.length % 4 === 0) {
      const fullTranscript = transcript
        .map((e) => `[${e.role === 'interviewer' ? 'AI' : 'Expert'}] ${e.text}`)
        .join('\n\n');

      try {
        await fetch(`/api/interviews/${activeInterview.id}/transcribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transcript: fullTranscript }),
        });
      } catch {
        // Non-critical
      }
    }
  }

  async function generatePost(interviewId: string) {
    try {
      const res = await fetch(`/api/interviews/${interviewId}/generate-post`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        alert(`Posts generated! Substack: "${data.posts.substack.title}", Blog: "${data.posts.blog.title}"`);
      }
    } catch (err) {
      console.error('Failed to generate post:', err);
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Interview Studio</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Conduct weekly expert interviews via text or audio.
          </p>
        </div>
        <button
          onClick={createInterview}
          disabled={creating}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {creating ? 'Creating...' : 'New Interview'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interview List */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sessions</h2>
          {interviews.map((interview) => (
            <button
              key={interview.id}
              onClick={() => setActiveInterview(interview)}
              className={`w-full text-left p-3 rounded-lg border transition-colors ${
                activeInterview?.id === interview.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {new Date(interview.scheduledDate).toLocaleDateString()}
                </span>
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  interview.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                  : interview.status === 'in-progress' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {interview.status}
                </span>
              </div>
              {interview.script?.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">{interview.script.length} questions prepared</p>
              )}
            </button>
          ))}
          {interviews.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
              No interviews yet.
            </p>
          )}
        </div>

        {/* Active Interview */}
        <div className="lg:col-span-2">
          {activeInterview ? (
            <div className="space-y-4">
              {/* Controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => generateScript(activeInterview.id)}
                  disabled={generatingScript}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 rounded-lg hover:bg-purple-200 disabled:opacity-50 transition-colors"
                >
                  {generatingScript ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                  {generatingScript ? 'Generating...' : 'Generate Script'}
                </button>
                {activeInterview.transcript && (
                  <button
                    onClick={() => generatePost(activeInterview.id)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    <FileText className="w-3 h-3" />
                    Generate Posts
                  </button>
                )}
              </div>

              {/* Script Preview */}
              {activeInterview.script?.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Script Preview</h3>
                  <ol className="space-y-2">
                    {activeInterview.script.map((q, i) => (
                      <li key={i} className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium text-gray-900 dark:text-white">{q.order}.</span> {q.question}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Interview Studio */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 h-[500px]">
                {agentToken ? (
                  <InterviewStudio
                    stackId={id}
                    interviewId={activeInterview.id}
                    agentToken={agentToken}
                    agentId="interview-conductor"
                    onTranscriptUpdate={handleTranscriptUpdate}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    Failed to get agent token.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[500px] bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-center text-gray-500">
                <p className="mb-2">Select an interview or create a new one.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
