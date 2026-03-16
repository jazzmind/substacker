import { NextRequest, NextResponse } from "next/server";
import { requireAuthWithTokenExchange } from "@/lib/auth-middleware";
import { ensureDataDocuments, listStacks, createStack } from "@/lib/data-api-client";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuthWithTokenExchange(request, "data-api");
    if (auth instanceof NextResponse) return auth;

    const ids = await ensureDataDocuments(auth.apiToken);
    const { stacks, total } = await listStacks(auth.apiToken, ids.stacks);

    return NextResponse.json({ stacks, total });
  } catch (error) {
    console.error("[API] GET /api/stacks error:", error);
    return NextResponse.json({ error: "Failed to list stacks" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuthWithTokenExchange(request, "data-api");
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();
    if (!body.name || !body.substackUrl || !body.expertName) {
      return NextResponse.json(
        { error: "name, substackUrl, and expertName are required" },
        { status: 400 }
      );
    }

    const ids = await ensureDataDocuments(auth.apiToken);
    const stack = await createStack(auth.apiToken, ids.stacks, body);

    return NextResponse.json(stack, { status: 201 });
  } catch (error) {
    console.error("[API] POST /api/stacks error:", error);
    return NextResponse.json({ error: "Failed to create stack" }, { status: 500 });
  }
}
