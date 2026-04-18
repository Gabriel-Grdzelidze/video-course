import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "You are LearnFlow AI, a helpful assistant for the LearnFlow online learning platform. Be concise and friendly." },
        ...messages,
      ],
      max_tokens: 1000,
    }),
  });

  const data = await response.json();
  console.log("Groq response:", JSON.stringify(data, null, 2));
  const text = data.choices?.[0]?.message?.content || "Sorry, I couldn't get a response.";
  return NextResponse.json({ text });
}