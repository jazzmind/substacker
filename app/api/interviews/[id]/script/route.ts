import { NextRequest, NextResponse } from "next/server";
import { requireAuthWithTokenExchange } from "@/lib/auth-middleware";
import {
  ensureDataDocuments, getInterview, updateInterview,
  getStack, getExpertProfile, getStrategy,
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

    const stack = await getStack(auth.apiToken, ids.stacks, interview.stackId);
    const profile = await getExpertProfile(auth.apiToken, ids.expertProfiles, interview.stackId);
    const strategy = await getStrategy(auth.apiToken, ids.strategies, interview.stackId);

    const prompt = `Generate an interview script for the weekly interview.

Publication: ${stack?.name || 'Unknown'}
Expert: ${stack?.expertName || 'Unknown'}
Topics: ${stack?.topics?.join(', ') || 'General'}
${profile ? `Expert's unique angle: ${profile.uniqueAngle}
Tone: ${profile.tone}` : ''}
${strategy ? `Content pillars: ${strategy.contentPillars?.join(', ')}` : ''}
${interview.trendingTopics?.length ? `Trending topics to cover: ${interview.trendingTopics.join(', ')}` : 'Search for trending topics in the expert\'s domain.'}

Generate 5-8 interview questions with context and follow-up hints. Return them as a JSON array of objects with fields: order, question, context, followUpHints.`;

    const SCRIPT_SCHEMA = {
      name: "interview_script",
      strict: true,
      schema: {
        type: "object",
        additionalProperties: false,
        required: ["questions"],
        properties: {
          questions: {
            type: "array",
            maxItems: 10,
            items: {
              type: "object",
              additionalProperties: false,
              required: ["order", "question", "context", "followUpHints"],
              properties: {
                order: { type: "number" },
                question: { type: "string" },
                context: { type: "string" },
                followUpHints: {
                  type: "array",
                  maxItems: 5,
                  items: { type: "string" },
                },
              },
            },
          },
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
        agent_name: "interview-conductor",
        input: { prompt },
        response_schema: SCRIPT_SCHEMA,
        agent_tier: "complex",
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ error: `Script generation failed: ${error}` }, { status: 500 });
    }

    const result = await response.json();
    const script = result.output?.questions || [];

    await updateInterview(auth.apiToken, ids.interviews, id, { script, status: 'scheduled' });

    return NextResponse.json({ success: true, script });
  } catch (error) {
    console.error("[API] POST /api/interviews/[id]/script error:", error);
    return NextResponse.json({ error: "Failed to generate script" }, { status: 500 });
  }
}
