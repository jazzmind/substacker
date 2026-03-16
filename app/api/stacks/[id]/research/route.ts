import { NextRequest, NextResponse } from "next/server";
import { requireAuthWithTokenExchange } from "@/lib/auth-middleware";
import { ensureDataDocuments, getStack, getExpertProfile, listCompetitors, deleteCompetitors } from "@/lib/data-api-client";

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
    const { competitors, total } = await listCompetitors(auth.apiToken, ids.competitors, id);

    return NextResponse.json({ competitors, total });
  } catch (error) {
    console.error("[API] GET /api/stacks/[id]/research error:", error);
    return NextResponse.json({ error: "Failed to list competitors" }, { status: 500 });
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

    // Clear old competitors before new research
    await deleteCompetitors(auth.apiToken, ids.competitors, id);

    const topics = stack.topics?.length ? stack.topics : profile?.expertise || [];
    const prompt = `Research competing Substacks on these topics: ${topics.join(', ')}. 
Expert: ${stack.expertName}. Publication: ${stack.name} (${stack.substackUrl}).
Find the top 5-10 most popular and successful Substacks covering similar topics.
Save each competitor to the competitors document (document_id: ${ids.competitors}) with stackId: "${id}".`;

    const response = await fetch(`${AGENT_API_URL}/runs/invoke`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${agentAuth.apiToken}`,
      },
      body: JSON.stringify({
        agent_name: "substack-researcher",
        input: { prompt },
        metadata: { stackId: id, documentsIds: ids },
        agent_tier: "complex",
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ error: `Research failed: ${error}` }, { status: 500 });
    }

    const result = await response.json();
    return NextResponse.json({ success: true, result: result.output });
  } catch (error) {
    console.error("[API] POST /api/stacks/[id]/research error:", error);
    return NextResponse.json({ error: "Failed to run research" }, { status: 500 });
  }
}
