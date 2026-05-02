import { NextResponse } from "next/server";
import { CLAUDE_MODEL, getUserAnthropic, NoApiKeyError } from "@/lib/claude";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const BUCKET = "progress-photos";

async function downloadAsBase64(
  supabase: ReturnType<typeof createClient>,
  path: string,
): Promise<{ data: string; mediaType: string } | null> {
  const { data, error } = await supabase.storage.from(BUCKET).download(path);
  if (error || !data) return null;
  const buf = Buffer.from(await data.arrayBuffer());
  // Cap at 4MB per image; resize would be better but adds deps
  if (buf.byteLength > 4 * 1024 * 1024) return null;
  const mediaType = data.type || "image/jpeg";
  return { data: buf.toString("base64"), mediaType };
}

export async function POST(req: Request) {
  try {
    const { date } = (await req.json()) as { date: string };
    if (!date) {
      return NextResponse.json({ error: "date required" }, { status: 400 });
    }

    const { client } = await getUserAnthropic();
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select(
        "name, gender, height, current_weight, target_weight, goal, body_fat_pct, waist_cm",
      )
      .eq("user_id", user.id)
      .single();

    // Fetch current check-in
    const { data: currentPhotos } = await supabase
      .from("progress_photos")
      .select("*")
      .eq("user_id", user.id)
      .eq("check_in_date", date);

    if (!currentPhotos || currentPhotos.length === 0) {
      return NextResponse.json(
        { error: "No photos for this check-in date" },
        { status: 400 },
      );
    }

    // Fetch previous check-in (latest before this date)
    const { data: prevPhotos } = await supabase
      .from("progress_photos")
      .select("*")
      .eq("user_id", user.id)
      .lt("check_in_date", date)
      .order("check_in_date", { ascending: false })
      .limit(3);
    const prevDate = prevPhotos?.[0]?.check_in_date ?? null;
    const previousAtSameDate = prevPhotos?.filter(
      (p) => p.check_in_date === prevDate,
    );

    // Build content array for Claude
    const content: any[] = [];
    content.push({
      type: "text",
      text: `Onderstaand vind je foto's van een check-in.\nProfiel: ${profile?.name}, ${profile?.gender}, ${profile?.height}cm, huidig gewicht ${profile?.current_weight}kg, doel ${profile?.target_weight}kg. Hoofddoel: ${profile?.goal}.${prevDate ? `\n\nVorige check-in was op ${prevDate}. De foto's hieronder bevatten EERST de vorige (referentie) en daarna de huidige.` : "\n\nDit is de eerste check-in (geen vorige om mee te vergelijken)."}\n\nGEEF GEEN GETALLEN voor vetpercentage of gewicht — visuele schattingen daarvan zijn onbetrouwbaar. Beschrijf alleen wat je visueel observeert.`,
    });

    if (previousAtSameDate && previousAtSameDate.length > 0) {
      content.push({ type: "text", text: `\n--- Vorige check-in (${prevDate}) ---` });
      for (const p of previousAtSameDate) {
        const img = await downloadAsBase64(supabase, p.storage_path);
        if (img) {
          content.push({ type: "text", text: `Hoek: ${p.angle}` });
          content.push({
            type: "image",
            source: {
              type: "base64",
              media_type: img.mediaType,
              data: img.data,
            },
          });
        }
      }
    }

    content.push({ type: "text", text: `\n--- Huidige check-in (${date}) ---` });
    for (const p of currentPhotos) {
      const img = await downloadAsBase64(supabase, p.storage_path);
      if (img) {
        content.push({ type: "text", text: `Hoek: ${p.angle}` });
        content.push({
          type: "image",
          source: {
            type: "base64",
            media_type: img.mediaType,
            data: img.data,
          },
        });
      }
    }

    content.push({
      type: "text",
      text: `\nGeef ALLEEN een JSON object terug, geen markdown:\n{\n  "summary": "1-2 zinnen overall observatie",\n  "observations": ["3-5 specifieke visuele observaties (per hoek of vergelijking met vorige)"],\n  "focus_areas": ["1-3 lichaamsdelen om komende weken op te focussen op basis van wat je ziet"],\n  "motivation": "1 motiverende zin"\n}`,
    });

    const response = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1024,
      system:
        "Je bent een ervaren fitness coach die kwalitatieve visuele observaties geeft over progressfoto's. Antwoord ALTIJD in het Nederlands. Geef GEEN body fat percentages of gewicht-schattingen op basis van foto's. Focus op concrete visuele veranderingen, houding, definitie. Antwoord ALLEEN met geldig JSON.",
      messages: [{ role: "user", content }],
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
        { error: "Could not parse assessment", raw: text },
        { status: 502 },
      );
    }

    // Persist assessment
    await supabase.from("photo_assessments").upsert(
      {
        user_id: user.id,
        check_in_date: date,
        assessment: parsed,
      },
      { onConflict: "user_id,check_in_date" },
    );

    return NextResponse.json(parsed);
  } catch (err: any) {
    if (err instanceof NoApiKeyError) {
      return NextResponse.json({ error: "no_api_key" }, { status: 402 });
    }
    console.error("/api/photo-assessment error", err);
    return NextResponse.json(
      { error: err.message ?? "internal error" },
      { status: 500 },
    );
  }
}
