import { AssemblyAI } from "assemblyai";
import { NextRequest, NextResponse } from "next/server";

const client = new AssemblyAI({
  apiKey: process.env.ASSEMBLYAI_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const { videoUrl, lessonId } = await req.json();

    const transcript = await client.transcripts.submit({
      audio_url: videoUrl,
      speech_models: ["universal-2"],
    });

    return NextResponse.json({ transcriptId: transcript.id });
  } catch (error: any) {
    console.error("Transcribe error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
export async function GET(req: NextRequest) {
  try {
    const transcriptId = req.nextUrl.searchParams.get("transcriptId");

    const transcript = await client.transcripts.get(transcriptId!);

    if (transcript.status === "completed") {
      const vtt = await client.transcripts.subtitles(transcriptId!, "vtt");
      return NextResponse.json({ status: "completed", vtt });
    }

    return NextResponse.json({ status: transcript.status });
  } catch (error: any) {
    console.error("Transcribe GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}