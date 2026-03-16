'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, FileText, Send, Eye } from 'lucide-react';
import type { Post } from '@/lib/types';

export default function PostsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState<string | null>(null);
  const [stackName, setStackName] = useState('');

  useEffect(() => {
    loadData();
  }, [id]);

  async function loadData() {
    try {
      const [postsRes, stackRes] = await Promise.all([
        fetch(`/api/posts?stackId=${id}`),
        fetch(`/api/stacks/${id}`),
      ]);
      if (postsRes.ok) {
        const data = await postsRes.json();
        setPosts(data.posts || []);
      }
      if (stackRes.ok) {
        const stack = await stackRes.json();
        setStackName(stack.name);
      }
    } catch (err) {
      console.error('Failed to load posts:', err);
    } finally {
      setLoading(false);
    }
  }

  async function publishPost(postId: string) {
    if (!confirm('Publish this post to Substack?')) return;
    setPublishing(postId);
    try {
      const res = await fetch(`/api/posts/${postId}/publish`, { method: 'POST' });
      if (res.ok) {
        await loadData();
      } else {
        const err = await res.json();
        alert(`Publish failed: ${err.error}`);
      }
    } catch (err) {
      console.error('Failed to publish:', err);
    } finally {
      setPublishing(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const drafts = posts.filter((p) => p.status === 'draft');
  const inReview = posts.filter((p) => p.status === 'review');
  const published = posts.filter((p) => p.status === 'published');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href={`/stacks/${id}`} className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to {stackName || 'Stack'}
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Posts</h1>

      {posts.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No posts yet</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Conduct an interview and generate posts to see them here.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Drafts */}
          {drafts.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="w-3 h-3 bg-yellow-500 rounded-full" />
                Drafts ({drafts.length})
              </h2>
              <div className="space-y-3">
                {drafts.map((post) => (
                  <PostCard key={post.id} post={post} stackId={id} onPublish={publishPost} publishing={publishing} />
                ))}
              </div>
            </section>
          )}

          {/* In Review */}
          {inReview.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="w-3 h-3 bg-blue-500 rounded-full" />
                In Review ({inReview.length})
              </h2>
              <div className="space-y-3">
                {inReview.map((post) => (
                  <PostCard key={post.id} post={post} stackId={id} onPublish={publishPost} publishing={publishing} />
                ))}
              </div>
            </section>
          )}

          {/* Published */}
          {published.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded-full" />
                Published ({published.length})
              </h2>
              <div className="space-y-3">
                {published.map((post) => (
                  <PostCard key={post.id} post={post} stackId={id} onPublish={publishPost} publishing={publishing} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function PostCard({
  post, stackId, onPublish, publishing,
}: {
  post: Post; stackId: string; onPublish: (id: string) => void; publishing: string | null;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Link
              href={`/stacks/${stackId}/posts/${post.id}`}
              className="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 transition-colors"
            >
              {post.title}
            </Link>
            <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded">
              {post.format}
            </span>
          </div>
          {post.subtitle && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{post.subtitle}</p>
          )}
          <p className="text-xs text-gray-500 mt-2">
            Created {new Date(post.createdAt).toLocaleDateString()}
            {post.publishedAt && ` · Published ${new Date(post.publishedAt).toLocaleDateString()}`}
          </p>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <Link
            href={`/stacks/${stackId}/posts/${post.id}`}
            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
            title="View/Edit"
          >
            <Eye className="w-4 h-4" />
          </Link>
          {post.status !== 'published' && (
            <button
              onClick={() => onPublish(post.id)}
              disabled={publishing === post.id}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              title="Publish to Substack"
            >
              {publishing === post.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
              Publish
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
