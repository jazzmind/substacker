import { NextRequest, NextResponse } from "next/server";
import { requireAuthWithTokenExchange } from "@/lib/auth-middleware";
import {
  ensureDataDocuments, getStack, getExpertProfile,
  listCompetitors, getStrategy, createStrategy,
} from "@/lib/data-api-client";

const AGENT_API_URL = process.env.AGENT_API_URL || "http://localhost:8000";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const auth = await requireAuthWithTokenExchange(request, "data-api");
    if (auth instanceof NextResponse) return auth;

    const ids = await ensureDataDocuments(auth.apiToken);
    const strategy = await getStrategy(auth.apiToken, ids.strategies, id);

    if (!strategy) {
      return NextResponse.json({ error: "No strategy found" }, { status: 404 });
    }
    return NextResponse.json(strategy);
  } catch (error) {
    console.error("[API] GET /api/stacks/[id]/strategy error:", error);
    return NextResponse.json({ error: "Failed to get strategy" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const auth = await requireAuthWithTokenExchange(request, "data-api");
    if (auth instanceof NextResponse) return auth;

    const agentAuth = await requireAuthWithTokenExchange(request, "agent-api");
    if (agentAuth instanceof NextResponse) return agentAuth;

    const ids = await ensureDataDocuments(auth.apiToken);
    const stack = await getStack(auth.apiToken, ids.stacks, id);
    if (!stack) {
      return NextResponse.json({ error: "Stack not found" }, { status: 404 });
    }

    const profile = await getExpertProfile(auth.apiToken, ids.expertProfiles, id);
    const { competitors } = await listCompetitors(auth.apiToken, ids.competitors, id);

    const prompt = `Create a comprehensive posting strategy for "${stack.name}" (${stack.substackUrl}).

Expert: ${stack.expertName}
Topics: ${stack.topics?.join(', ') || 'General'}
${profile ? `Tone: ${profile.tone}
Target Audience: ${profile.targetAudience}
Unique Angle: ${profile.uniqueAngle}
Expertise: ${profile.expertise?.join(', ')}` : 'No expert profile yet.'}

Competitors analyzed: ${competitors.length}
${competitors.map(c => `- ${c.name}: ${c.postingFrequency}, topics: ${c.topTopics?.join(', ')}`).join('\n')}

Generate a complete strategy with posting schedule, content pillars, topic calendar (8 weeks), growth tactics, and tone guidelines.
Save the strategy to the strategies document (document_id: ${ids.strategies}) with stackId: "${id}".`;

    const response = await fetch(`${AGENT_API_URL}/runs/invoke`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${agentAuth.apiToken}`,
      },
      body: JSON.stringify({
        agent_name: "strategy-architect",
        input: { prompt },
        metadata: { stackId: id, documentIds: ids },
        agent_tier: "complex",
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ error: `Strategy generation failed: ${error}` }, { status: 500 });
    }

    const result = await response.json();

    // Also create a local strategy record if the agent didn't
    const existingStrategy = await getStrategy(auth.apiToken, ids.strategies, id);
    if (!existingStrategy) {
      await createStrategy(auth.apiToken, ids.strategies, {
        stackId: id,
        toneGuidelines: result.output || '',
      });
    }

    return NextResponse.json({ success: true, result: result.output });
  } catch (error) {
    console.error("[API] POST /api/stacks/[id]/strategy error:", error);
    return NextResponse.json({ error: "Failed to generate strategy" }, { status: 500 });
  }
}
