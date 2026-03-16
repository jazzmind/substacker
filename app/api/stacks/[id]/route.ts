import { NextRequest, NextResponse } from "next/server";
import { requireAuthWithTokenExchange } from "@/lib/auth-middleware";
import { ensureDataDocuments, getStack, updateStack, deleteStack } from "@/lib/data-api-client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const auth = await requireAuthWithTokenExchange(request, "data-api");
    if (auth instanceof NextResponse) return auth;

    const ids = await ensureDataDocuments(auth.apiToken);
    const stack = await getStack(auth.apiToken, ids.stacks, id);

    if (!stack) {
      return NextResponse.json({ error: "Stack not found" }, { status: 404 });
    }
    return NextResponse.json(stack);
  } catch (error) {
    console.error("[API] GET /api/stacks/[id] error:", error);
    return NextResponse.json({ error: "Failed to get stack" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const auth = await requireAuthWithTokenExchange(request, "data-api");
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();
    const ids = await ensureDataDocuments(auth.apiToken);
    const stack = await updateStack(auth.apiToken, ids.stacks, id, body);

    if (!stack) {
      return NextResponse.json({ error: "Stack not found" }, { status: 404 });
    }
    return NextResponse.json(stack);
  } catch (error) {
    console.error("[API] PUT /api/stacks/[id] error:", error);
    return NextResponse.json({ error: "Failed to update stack" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const auth = await requireAuthWithTokenExchange(request, "data-api");
    if (auth instanceof NextResponse) return auth;

    const ids = await ensureDataDocuments(auth.apiToken);
    const deleted = await deleteStack(auth.apiToken, ids.stacks, id);

    if (!deleted) {
      return NextResponse.json({ error: "Stack not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API] DELETE /api/stacks/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete stack" }, { status: 500 });
  }
}
