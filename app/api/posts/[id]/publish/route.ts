import { NextRequest, NextResponse } from "next/server";
import { requireAuthWithTokenExchange } from "@/lib/auth-middleware";
import { ensureDataDocuments, getPost, updatePost, getStack } from "@/lib/data-api-client";
import { createDraft, publishPost } from "@/lib/substack-client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const auth = await requireAuthWithTokenExchange(request, "data-api");
    if (auth instanceof NextResponse) return auth;

    const ids = await ensureDataDocuments(auth.apiToken);
    const post = await getPost(auth.apiToken, ids.posts, id);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const stack = await getStack(auth.apiToken, ids.stacks, post.stackId);
    if (!stack) {
      return NextResponse.json({ error: "Stack not found" }, { status: 404 });
    }

    const body = await request.json().catch(() => ({}));
    const publishImmediately = body.publish !== false;

    // Create draft on Substack
    const draft = await createDraft(
      stack.substackUrl,
      post.title,
      post.content,
      post.subtitle
    );

    let substackPostId = draft.id;

    if (publishImmediately) {
      const result = await publishPost(stack.substackUrl, draft.id);
      substackPostId = result.id;
    }

    await updatePost(auth.apiToken, ids.posts, id, {
      substackPostId,
      status: publishImmediately ? 'published' : 'review',
      publishedAt: publishImmediately ? new Date().toISOString() : undefined,
    });

    return NextResponse.json({
      success: true,
      substackPostId,
      published: publishImmediately,
    });
  } catch (error) {
    console.error("[API] POST /api/posts/[id]/publish error:", error);
    const message = error instanceof Error ? error.message : "Failed to publish";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
