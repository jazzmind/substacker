'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Loader2, MessageSquare } from 'lucide-react';

export default function ChatPage() {
  const [agentToken, setAgentToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [ChatComponent, setChatComponent] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/auth/token');
        if (res.ok) {
          const data = await res.json();
          setAgentToken(data.token);
        }

        const mod = await import('@jazzmind/busibox-app');
        if (mod.SimpleChatInterface) {
          setChatComponent(() => mod.SimpleChatInterface);
        }
      } catch (err) {
        console.error('Failed to load chat:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Substacker Assistant</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Ask questions about your stacks, strategies, interviews, and content.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 h-[600px]">
        {agentToken && ChatComponent ? (
          <ChatComponent
            token={agentToken}
            agentId="strategy-architect"
            placeholder="Ask about your Substacks..."
            welcomeMessage="Hi! I'm your Substacker assistant. I can help you with content strategy, analyze your stacks, and answer questions about your publications. What would you like to know?"
            enableDocSearch={true}
            useAgenticStreaming={true}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <MessageSquare className="w-12 h-12 mb-4 opacity-50" />
            <p>Unable to load chat. Please refresh the page.</p>
          </div>
        )}
      </div>
    </div>
  );
}
