import { NextRequest, NextResponse } from "next/server";
import { EdgeTTS } from "node-edge-tts";
import { readFileSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomBytes } from "node:crypto";

export async function POST(req: NextRequest) {
  const tmpFile = join(tmpdir(), `tts-${randomBytes(8).toString("hex")}.mp3`);

  try {
    const { text } = await req.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'text' field" },
        { status: 400 }
      );
    }

    // Use Microsoft Edge TTS — completely free, no API key needed.
    const edgeTTS = new EdgeTTS({
      voice: "en-US-GuyNeural",
      lang: "en-US",
      outputFormat: "audio-24khz-48kbitrate-mono-mp3",
      rate: "default",
      pitch: "default",
      volume: "default",
      timeout: 30000,
    });

    await edgeTTS.ttsPromise(text, tmpFile);

    const audioData = readFileSync(tmpFile);

    // Clean up temp file
    try { unlinkSync(tmpFile); } catch { /* ignore */ }

    if (!audioData || audioData.length === 0) {
      return NextResponse.json(
        { error: "Edge TTS returned empty audio" },
        { status: 502 }
      );
    }

    console.log(`Edge TTS success — ${audioData.length} bytes`);

    return new NextResponse(new Uint8Array(audioData), {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(audioData.length),
      },
    });
  } catch (error) {
    // Clean up temp file on error
    try { unlinkSync(tmpFile); } catch { /* ignore */ }

    console.error("TTS route error:", error);
    return NextResponse.json(
      { error: `TTS failed: ${error instanceof Error ? error.message : "unknown"}` },
      { status: 500 }
    );
  }
}
