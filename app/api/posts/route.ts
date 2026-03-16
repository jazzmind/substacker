import { NextRequest, NextResponse } from "next/server";
import { requireAuthWithTokenExchange } from "@/lib/auth-middleware";
import { ensureDataDocuments, listPosts, createPost } from "@/lib/data-api-client";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuthWithTokenExchange(request, "data-api");
    if (auth instanceof NextResponse) return auth;

    const stackId = request.nextUrl.searchParams.get("stackId");
    if (!stackId) {
      return NextResponse.json({ error: "stackId is required" }, { status: 400 });
    }

    const status = request.nextUrl.searchParams.get("status") || undefined;
    const ids = await ensureDataDocuments(auth.apiToken);
    const { posts, total } = await listPosts(auth.apiToken, ids.posts, stackId, { status });

    return NextResponse.json({ posts, total });
  } catch (error) {
    console.error("[API] GET /api/posts error:", error);
    return NextResponse.json({ error: "Failed to list posts" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuthWithTokenExchange(request, "data-api");
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();
    if (!body.stackId || !body.title || !body.content) {
      return NextResponse.json(
        { error: "stackId, title, and content are required" },
        { status: 400 }
      );
    }

    const ids = await ensureDataDocuments(auth.apiToken);
    const post = await createPost(auth.apiToken, ids.posts, body);

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    console.error("[API] POST /api/posts error:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
