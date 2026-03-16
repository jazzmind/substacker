/**
 * Audio Client - TTS and STT functions that proxy to the agent-api audio endpoints.
 *
 * TTS: POST /api/audio/tts -> agent-api POST /llm/audio/speech
 * STT: POST /api/audio/stt -> agent-api POST /llm/audio/transcribe
 */

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export async function textToSpeech(
  text: string,
  voice: string = 'alloy'
): Promise<ArrayBuffer> {
  const response = await fetch(`${basePath}/api/audio/tts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, voice }),
    credentials: 'include',
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`TTS failed: ${err}`);
  }

  return response.arrayBuffer();
}

export async function speechToText(audioBlob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append('file', audioBlob, 'recording.wav');

  const response = await fetch(`${basePath}/api/audio/stt`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`STT failed: ${err}`);
  }

  const data = await response.json();
  return data.text;
}
