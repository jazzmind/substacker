import { NextRequest, NextResponse } from "next/server";
import { requireAuthWithTokenExchange } from "@/lib/auth-middleware";
import { ensureDataDocuments, DOCUMENTS } from "@/lib/data-api-client";

export async function GET(request: NextRequest) {
  const auth = await requireAuthWithTokenExchange(request, "data-api");
  if (auth instanceof NextResponse) return auth;
  const ids = await ensureDataDocuments(auth.apiToken);

  return NextResponse.json({
    initialized: true,
    documents: Object.entries(DOCUMENTS).map(([key, name]) => ({
      key: key.toLowerCase(),
      name,
      id: ids[key.toLowerCase().replace(/_([a-z])/g, (_, c) => c.toUpperCase()) as keyof typeof ids],
    })),
  });
}

export async function POST(request: NextRequest) {
  const auth = await requireAuthWithTokenExchange(request, "data-api");
  if (auth instanceof NextResponse) return auth;
  const ids = await ensureDataDocuments(auth.apiToken);

  return NextResponse.json({ success: true, documentIds: ids });
}
