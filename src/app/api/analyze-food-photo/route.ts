import { NextResponse } from "next/server";
import {
  CLAUDE_MODEL,
  getUserAnthropic,
  logUsage,
  NoApiKeyError,
} from "@/lib/claude";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Accepts multipart/form-data with `image` field, OR JSON { imageBase64, mimeType }.
 * Returns { description, calories, protein, carbs, fat, items: [...] }
 */
export async function POST(req: Request) {
  try {
    let imageBase64: string | null = null;
    let mimeType: string = "image/jpeg";

    const contentType = req.headers.get("content-type") ?? "";
    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("image");
      if (!(file instanceof File)) {
        return NextResponse.json(
          { error: "image file required" },
          { status: 400 },
        );
      }
      const buf = Buffer.from(await file.arrayBuffer());
      // Cap at 5MB
      if (buf.byteLength > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: "Foto te groot (max 5MB)" },
          { status: 400 },
        );
      }
      imageBase64 = buf.toString("base64");
      mimeType = file.type || "image/jpeg";
    } else {
      const body = (await req.json()) as {
        imageBase64?: string;
        mimeType?: string;
      };
      if (!body.imageBase64) {
        return NextResponse.json(
          { error: "imageBase64 required" },
          { status: 400 },
        );
      }
      imageBase64 = body.imageBase64;
      mimeType = body.mimeType ?? "image/jpeg";
    }

    const { client, userId, usedManaged } = await getUserAnthropic();

    // Get user profile context for better estimation (portion sizes)
    const supabase = createClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("name, current_weight, goal, diet_style, intolerances")
      .eq("user_id", userId)
      .single();

    const profileCtx = profile
      ? `Profiel: ${profile.name}, ${profile.current_weight}kg, doel: ${profile.goal}, dieet: ${profile.diet_style}.`
      : "";

    const response = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 800,
      system: `Je bent een nutritionist die voedingswaarde inschat op basis van foto's. ${profileCtx} Antwoord ALTIJD in het Nederlands voor de description. Geef redelijke schattingen — beter een gok dan niets. Antwoord ALLEEN met geldig JSON, geen markdown.`,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mimeType as any,
                data: imageBase64,
              },
            },
            {
              type: "text",
              text: `Identificeer wat er op deze foto van eten staat en schat de voedingswaarde voor de TOTALE portie zichtbaar.

Antwoord ALLEEN met geldig JSON in deze structuur:
{
  "description": "Korte Nederlandse beschrijving van wat je ziet, met geschatte hoeveelheden. Bijv: 'Bord pasta bolognese (~250g) met geraspte kaas (~20g)'",
  "calories": <totaal kcal als number>,
  "protein": <g eiwit>,
  "carbs": <g koolhydraten>,
  "fat": <g vet>,
  "items": [
    { "name": "<item naam>", "kcal": <number>, "protein": <number> }
  ],
  "confidence": "<low|medium|high>"
}`,
            },
          ],
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
        { error: "Kon AI antwoord niet parseren", raw: text },
        { status: 502 },
      );
    }

    await logUsage({
      userId,
      callType: "photo",
      usedManaged,
      inputTokens: response.usage?.input_tokens ?? 0,
      outputTokens: response.usage?.output_tokens ?? 0,
    });

    return NextResponse.json(parsed);
  } catch (err: any) {
    if (err instanceof NoApiKeyError) {
      return NextResponse.json({ error: "no_api_key" }, { status: 402 });
    }
    console.error("/api/analyze-food-photo error", err);
    return NextResponse.json(
      { error: err.message ?? "internal error" },
      { status: 500 },
    );
  }
}
