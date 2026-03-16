import { NextRequest, NextResponse } from "next/server";
import { requireAuthWithTokenExchange } from "@/lib/auth-middleware";
import { ensureDataDocuments, getInterview, updateInterview } from "@/lib/data-api-client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const auth = await requireAuthWithTokenExchange(request, "data-api");
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();
    const { transcript } = body;

    if (!transcript) {
      return NextResponse.json({ error: "transcript is required" }, { status: 400 });
    }

    const ids = await ensureDataDocuments(auth.apiToken);
    const interview = await getInterview(auth.apiToken, ids.interviews, id);
    if (!interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    const updated = await updateInterview(auth.apiToken, ids.interviews, id, {
      transcript,
      status: 'completed',
    });

    return NextResponse.json({ success: true, interview: updated });
  } catch (error) {
    console.error("[API] POST /api/interviews/[id]/transcribe error:", error);
    return NextResponse.json({ error: "Failed to save transcript" }, { status: 500 });
  }
}
