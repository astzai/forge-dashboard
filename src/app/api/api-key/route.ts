import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { encrypt } from "@/lib/crypto";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { apiKey } = (await req.json()) as { apiKey: string };
    if (!apiKey || typeof apiKey !== "string") {
      return NextResponse.json({ error: "apiKey required" }, { status: 400 });
    }
    if (!apiKey.startsWith("sk-ant-")) {
      return NextResponse.json(
        { error: "Anthropic keys start with 'sk-ant-'." },
        { status: 400 },
      );
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const enc = encrypt(apiKey);
    const { error } = await supabase
      .from("profiles")
      .update({ encrypted_anthropic_key: enc })
      .eq("user_id", user.id);
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("/api/api-key error", err);
    return NextResponse.json({ error: err.message ?? "internal error" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    const { error } = await supabase
      .from("profiles")
      .update({ encrypted_anthropic_key: null })
      .eq("user_id", user.id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "internal error" }, { status: 500 });
  }
}
