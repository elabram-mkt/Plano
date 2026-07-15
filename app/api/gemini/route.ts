import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

// Initialize the GoogleGenAI client with the environment variable and proper user-agent headers
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid messages history provided." },
        { status: 400 }
      );
    }

    // Format messages into the structure required by the @google/genai SDK:
    // [{ role: "user" | "model", parts: [{ text: string }] }]
    const formattedContents = messages.map((m: { role: string; content: string }) => {
      // @google/genai uses 'model' instead of 'assistant'
      const sdkRole = m.role === "assistant" ? "model" : "user";
      return {
        role: sdkRole,
        parts: [{ text: m.content }],
      };
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents,
      config: {
        systemInstruction: `You are Plano AI, an expert social media manager and copywriting assistant.
Help the user generate high-engagement captions, suggest hashtags, optimize posting schedules, and brainstorm ideas for Instagram, X (Twitter), LinkedIn, Facebook, TikTok, and Threads.
Keep your answers highly practical, concise, and structured with clear recommendations and actionable examples.`,
      },
    });

    const text = response.text || "I'm sorry, I couldn't generate a response.";
    return NextResponse.json({ response: text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json(
      { error: error?.message || "An unexpected error occurred during generation." },
      { status: 500 }
    );
  }
}
