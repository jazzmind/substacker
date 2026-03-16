import { NextRequest, NextResponse } from "next/server";
import { requireAuthWithTokenExchange } from "@/lib/auth-middleware";
import { ensureDataDocuments, listAnalytics, createAnalyticsEntry } from "@/lib/data-api-client";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuthWithTokenExchange(request, "data-api");
    if (auth instanceof NextResponse) return auth;

    const stackId = request.nextUrl.searchParams.get("stackId");
    if (!stackId) {
      return NextResponse.json({ error: "stackId is required" }, { status: 400 });
    }

    const ids = await ensureDataDocuments(auth.apiToken);
    const { entries, total } = await listAnalytics(auth.apiToken, ids.analytics, stackId);

    return NextResponse.json({ entries, total });
  } catch (error) {
    console.error("[API] GET /api/analytics error:", error);
    return NextResponse.json({ error: "Failed to list analytics" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuthWithTokenExchange(request, "data-api");
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();
    if (!body.stackId || !body.postId) {
      return NextResponse.json(
        { error: "stackId and postId are required" },
        { status: 400 }
      );
    }

    const ids = await ensureDataDocuments(auth.apiToken);
    const entry = await createAnalyticsEntry(auth.apiToken, ids.analytics, body);

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error("[API] POST /api/analytics error:", error);
    return NextResponse.json({ error: "Failed to create analytics entry" }, { status: 500 });
  }
}
