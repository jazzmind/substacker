'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save, Send } from 'lucide-react';
import type { Post } from '@/lib/types';

export default function PostEditorPage({ params }: { params: Promise<{ id: string; postId: string }> }) {
  const { id, postId } = use(params);
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/posts/${postId}`);
        if (res.ok) {
          const data = await res.json();
          setPost(data);
          setTitle(data.title);
          setSubtitle(data.subtitle || '');
          setContent(data.content);
        }
      } catch (err) {
        console.error('Failed to load post:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [postId]);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, subtitle, content }),
      });
      if (res.ok) {
        const updated = await res.json();
        setPost(updated);
      }
    } catch (err) {
      console.error('Failed to save post:', err);
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    if (!confirm('Publish this post to Substack?')) return;
    try {
      // Save first
      await handleSave();
      const res = await fetch(`/api/posts/${postId}/publish`, { method: 'POST' });
      if (res.ok) {
        const result = await res.json();
        alert(`Published successfully! Substack post ID: ${result.substackPostId}`);
        // Reload
        const postRes = await fetch(`/api/posts/${postId}`);
        if (postRes.ok) setPost(await postRes.json());
      } else {
        const err = await res.json();
        alert(`Publish failed: ${err.error}`);
      }
    } catch (err) {
      console.error('Failed to publish:', err);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">Post not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href={`/stacks/${id}/posts`} className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Posts
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
            post.status === 'published' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
            : post.status === 'review' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
          }`}>
            {post.status}
          </span>
          <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded">
            {post.format}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save'}
          </button>
          {post.status !== 'published' && (
            <button
              onClick={handlePublish}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Send className="w-4 h-4" />
              Publish
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title..."
            className="w-full text-2xl font-bold px-0 py-2 bg-transparent border-0 border-b-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400"
          />
        </div>
        <div>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Subtitle (optional)..."
            className="w-full text-lg px-0 py-2 bg-transparent border-0 border-b border-gray-100 dark:border-gray-800 focus:border-blue-500 focus:ring-0 text-gray-700 dark:text-gray-300 placeholder-gray-400"
          />
        </div>
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={25}
            placeholder="Write your post content in markdown..."
            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400 font-mono text-sm"
          />
        </div>
      </div>
    </div>
  );
}
