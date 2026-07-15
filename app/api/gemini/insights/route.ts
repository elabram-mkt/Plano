import { GoogleGenAI, Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

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
    const { analyticsSummary } = body;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `You are Plano AI's Analytics Intelligence Engine. Analyze the following social media performance data and generate exactly 3 highly specific, professional, and actionable growth recommendations.

Data Summary:
${JSON.stringify(analyticsSummary, null, 2)}

Provide your response in JSON matching the requested schema. Ensure the recommendations are realistic, practical, and directly tied to the platform or date range trends.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            insights: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: {
                    type: Type.STRING,
                    description: "Concise title of the recommendation (e.g., 'Instagram Hook Optimization').",
                  },
                  description: {
                    type: Type.STRING,
                    description: "Actionable details explaining exactly what to change and why.",
                  },
                  platform: {
                    type: Type.STRING,
                    description: "Specific platform target (e.g., 'Instagram', 'LinkedIn', 'X', or 'All Platforms').",
                  },
                  impact: {
                    type: Type.STRING,
                    description: "Impact tier: 'High Impact', 'Medium Impact', or 'Low Impact'.",
                  },
                },
                required: ["title", "description", "platform", "impact"],
              },
            },
          },
          required: ["insights"],
        },
      },
    });

    const text = response.text || "{}";
    const parsed = JSON.parse(text);
    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error("Insights API Error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate AI insights." },
      { status: 500 }
    );
  }
}
