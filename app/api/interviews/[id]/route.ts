import { NextRequest, NextResponse } from "next/server";
import { requireAuthWithTokenExchange } from "@/lib/auth-middleware";
import { ensureDataDocuments, getInterview, updateInterview } from "@/lib/data-api-client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const auth = await requireAuthWithTokenExchange(request, "data-api");
    if (auth instanceof NextResponse) return auth;

    const ids = await ensureDataDocuments(auth.apiToken);
    const interview = await getInterview(auth.apiToken, ids.interviews, id);

    if (!interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }
    return NextResponse.json(interview);
  } catch (error) {
    console.error("[API] GET /api/interviews/[id] error:", error);
    return NextResponse.json({ error: "Failed to get interview" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const auth = await requireAuthWithTokenExchange(request, "data-api");
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();
    const ids = await ensureDataDocuments(auth.apiToken);
    const interview = await updateInterview(auth.apiToken, ids.interviews, id, body);

    if (!interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }
    return NextResponse.json(interview);
  } catch (error) {
    console.error("[API] PUT /api/interviews/[id] error:", error);
    return NextResponse.json({ error: "Failed to update interview" }, { status: 500 });
  }
}
