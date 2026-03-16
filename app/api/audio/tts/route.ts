import { NextRequest, NextResponse } from "next/server";
import { requireAuthWithTokenExchange } from "@/lib/auth-middleware";

const AGENT_API_URL = process.env.AGENT_API_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuthWithTokenExchange(request, "agent-api");
    if (auth instanceof NextResponse) return auth;

    const { text, voice } = await request.json();
    if (!text) {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }

    const response = await fetch(`${AGENT_API_URL}/llm/audio/speech`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth.apiToken}`,
      },
      body: JSON.stringify({
        input: text,
        voice: voice || "alloy",
        model: "kokoro",
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ error: `TTS failed: ${error}` }, { status: response.status });
    }

    const audioBuffer = await response.arrayBuffer();
    return new Response(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "audio/wav",
        "Content-Length": String(audioBuffer.byteLength),
      },
    });
  } catch (error) {
    console.error("[API] POST /api/audio/tts error:", error);
    return NextResponse.json({ error: "TTS failed" }, { status: 500 });
  }
}
