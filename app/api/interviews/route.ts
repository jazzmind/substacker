import { NextRequest, NextResponse } from "next/server";
import { requireAuthWithTokenExchange } from "@/lib/auth-middleware";
import { ensureDataDocuments, listInterviews, createInterview } from "@/lib/data-api-client";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuthWithTokenExchange(request, "data-api");
    if (auth instanceof NextResponse) return auth;

    const stackId = request.nextUrl.searchParams.get("stackId");
    if (!stackId) {
      return NextResponse.json({ error: "stackId is required" }, { status: 400 });
    }

    const ids = await ensureDataDocuments(auth.apiToken);
    const { interviews, total } = await listInterviews(auth.apiToken, ids.interviews, stackId);

    return NextResponse.json({ interviews, total });
  } catch (error) {
    console.error("[API] GET /api/interviews error:", error);
    return NextResponse.json({ error: "Failed to list interviews" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuthWithTokenExchange(request, "data-api");
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();
    if (!body.stackId) {
      return NextResponse.json({ error: "stackId is required" }, { status: 400 });
    }

    const ids = await ensureDataDocuments(auth.apiToken);
    const interview = await createInterview(auth.apiToken, ids.interviews, body);

    return NextResponse.json(interview, { status: 201 });
  } catch (error) {
    console.error("[API] POST /api/interviews error:", error);
    return NextResponse.json({ error: "Failed to create interview" }, { status: 500 });
  }
}
