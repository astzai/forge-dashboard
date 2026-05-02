import { NextResponse } from "next/server";
import { CLAUDE_MODEL, getUserAnthropic, NoApiKeyError } from "@/lib/claude";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { food } = (await req.json()) as { food: string };
    if (!food?.trim()) {
      return NextResponse.json({ error: "food required" }, { status: 400 });
    }

    const { client } = await getUserAnthropic();

    const response = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1024,
      system:
        "Je bent een nutritionist. Geef accurate schattingen van calorieën en macros. Antwoord ALLEEN met geldige JSON, geen markdown, geen uitleg.",
      messages: [
        {
          role: "user",
          content: `Analyseer dit voedsel en geef ALLEEN een JSON object terug, geen andere tekst:\n${food}\n\nGeef terug: {"calories": number, "protein": number, "carbs": number, "fat": number, "items": [{"name": "...", "kcal": number, "protein": number}]}`,
        },
      ],
    });

    const text = response.content
      .map((b: any) => (b.type === "text" ? b.text : ""))
      .join("")
      .replace(/```json|```/g, "")
      .trim();

    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { error: "Could not parse nutrition response", raw: text },
        { status: 502 },
      );
    }

    return NextResponse.json(parsed);
  } catch (err: any) {
    if (err instanceof NoApiKeyError) {
      return NextResponse.json({ error: "no_api_key" }, { status: 402 });
    }
    console.error("/api/analyze-food error", err);
    return NextResponse.json(
      { error: err.message ?? "internal error" },
      { status: 500 },
    );
  }
}
