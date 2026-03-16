import { NextRequest, NextResponse } from "next/server";
import { requireAuthWithTokenExchange } from "@/lib/auth-middleware";

const AGENT_API_URL = process.env.AGENT_API_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuthWithTokenExchange(request, "agent-api");
    if (auth instanceof NextResponse) return auth;

    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "audio file is required" }, { status: 400 });
    }

    const upstreamForm = new FormData();
    upstreamForm.append("file", file, "recording.wav");

    const response = await fetch(`${AGENT_API_URL}/llm/audio/transcribe`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${auth.apiToken}`,
      },
      body: upstreamForm,
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ error: `STT failed: ${error}` }, { status: response.status });
    }

    const result = await response.json();
    return NextResponse.json({ text: result.text || result.transcript || "" });
  } catch (error) {
    console.error("[API] POST /api/audio/stt error:", error);
    return NextResponse.json({ error: "STT failed" }, { status: 500 });
  }
}
