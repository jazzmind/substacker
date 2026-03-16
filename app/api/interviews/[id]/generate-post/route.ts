import { NextRequest, NextResponse } from "next/server";
import { requireAuthWithTokenExchange } from "@/lib/auth-middleware";
import {
  ensureDataDocuments, getInterview, updateInterview,
  getStack, getExpertProfile, getStrategy, createPost,
} from "@/lib/data-api-client";

const AGENT_API_URL = process.env.AGENT_API_URL || "http://localhost:8000";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const auth = await requireAuthWithTokenExchange(request, "data-api");
    if (auth instanceof NextResponse) return auth;

    const agentAuth = await requireAuthWithTokenExchange(request, "agent-api");
    if (agentAuth instanceof NextResponse) return agentAuth;

    const ids = await ensureDataDocuments(auth.apiToken);
    const interview = await getInterview(auth.apiToken, ids.interviews, id);
    if (!interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    if (!interview.transcript) {
      return NextResponse.json({ error: "Interview has no transcript" }, { status: 400 });
    }

    const stack = await getStack(auth.apiToken, ids.stacks, interview.stackId);
    const profile = await getExpertProfile(auth.apiToken, ids.expertProfiles, interview.stackId);
    const strategy = await getStrategy(auth.apiToken, ids.strategies, interview.stackId);

    const prompt = `Transform this interview transcript into a Substack post and a blog post.

Publication: ${stack?.name || 'Unknown'}
Expert: ${stack?.expertName || 'Unknown'}
${profile ? `Tone: ${profile.tone}
Target Audience: ${profile.targetAudience}` : ''}
${strategy ? `Tone Guidelines: ${strategy.toneGuidelines}` : ''}

Interview Transcript:
${interview.transcript}

Create two pieces of content:
1. A Substack newsletter post with a compelling title, subtitle, and formatted content
2. A blog version optimized for SEO

Return them as JSON with fields: substackTitle, substackSubtitle, substackContent, blogTitle, blogSubtitle, blogContent.`;

    const POST_SCHEMA = {
      name: "generated_posts",
      strict: true,
      schema: {
        type: "object",
        additionalProperties: false,
        required: ["substackTitle", "substackSubtitle", "substackContent", "blogTitle", "blogSubtitle", "blogContent"],
        properties: {
          substackTitle: { type: "string" },
          substackSubtitle: { type: "string" },
          substackContent: { type: "string" },
          blogTitle: { type: "string" },
          blogSubtitle: { type: "string" },
          blogContent: { type: "string" },
        },
      },
    };

    const response = await fetch(`${AGENT_API_URL}/runs/invoke`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${agentAuth.apiToken}`,
      },
      body: JSON.stringify({
        agent_name: "content-writer",
        input: { prompt },
        response_schema: POST_SCHEMA,
        agent_tier: "complex",
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ error: `Post generation failed: ${error}` }, { status: 500 });
    }

    const result = await response.json();
    const output = result.output;

    const substackPost = await createPost(auth.apiToken, ids.posts, {
      stackId: interview.stackId,
      interviewId: id,
      title: output.substackTitle,
      subtitle: output.substackSubtitle,
      content: output.substackContent,
      format: 'substack',
    });

    const blogPost = await createPost(auth.apiToken, ids.posts, {
      stackId: interview.stackId,
      interviewId: id,
      title: output.blogTitle,
      subtitle: output.blogSubtitle,
      content: output.blogContent,
      format: 'blog',
    });

    await updateInterview(auth.apiToken, ids.interviews, id, {
      generatedPostId: substackPost.id,
    });

    return NextResponse.json({
      success: true,
      posts: { substack: substackPost, blog: blogPost },
    });
  } catch (error) {
    console.error("[API] POST /api/interviews/[id]/generate-post error:", error);
    return NextResponse.json({ error: "Failed to generate posts" }, { status: 500 });
  }
}
