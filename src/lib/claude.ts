import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { decrypt } from "@/lib/crypto";
import { CLAUDE_MODEL } from "@/lib/constants";

export class NoApiKeyError extends Error {
  constructor() {
    super(
      "No Anthropic API key available — neither user-level nor managed mode is configured.",
    );
    this.name = "NoApiKeyError";
  }
}

export type CallType =
  | "chat"
  | "photo"
  | "daily"
  | "weekly"
  | "food"
  | "schedule";

/**
 * Returns an Anthropic SDK client.
 *
 * Priority:
 *  1. User has stored their own key (BYOK)  → use that  (used_managed=false)
 *  2. MANAGED_ANTHROPIC_KEY env var is set  → use that  (used_managed=true)
 *  3. Neither                               → NoApiKeyError
 */
export async function getUserAnthropic(): Promise<{
  client: Anthropic;
  userId: string;
  usedManaged: boolean;
}> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Not signed in");
  }

  // Step 1: try user's own (encrypted) key
  const { data, error } = await supabase
    .from("profiles")
    .select("encrypted_anthropic_key")
    .eq("user_id", user.id)
    .single();

  if (!error && data?.encrypted_anthropic_key) {
    try {
      const apiKey = decrypt(data.encrypted_anthropic_key);
      return {
        client: new Anthropic({ apiKey }),
        userId: user.id,
        usedManaged: false,
      };
    } catch {
      // fall through to managed
    }
  }

  // Step 2: managed key
  const managedKey = process.env.MANAGED_ANTHROPIC_KEY;
  if (managedKey && managedKey.startsWith("sk-ant-")) {
    return {
      client: new Anthropic({ apiKey: managedKey }),
      userId: user.id,
      usedManaged: true,
    };
  }

  throw new NoApiKeyError();
}

/**
 * Best-effort logging of token usage. Never throws.
 * Pricing aligned with Claude Sonnet 4 (~$3/M input, ~$15/M output).
 */
export async function logUsage(opts: {
  userId: string;
  callType: CallType;
  usedManaged: boolean;
  inputTokens: number;
  outputTokens: number;
}) {
  try {
    const supabase = createClient();
    const usdInPer1M = 3;
    const usdOutPer1M = 15;
    const usdToEur = 0.92;
    const costEur =
      ((opts.inputTokens / 1_000_000) * usdInPer1M +
        (opts.outputTokens / 1_000_000) * usdOutPer1M) *
      usdToEur;
    await supabase.from("ai_usage").insert({
      user_id: opts.userId,
      call_type: opts.callType,
      used_managed: opts.usedManaged,
      input_tokens: opts.inputTokens,
      output_tokens: opts.outputTokens,
      cost_eur: Number(costEur.toFixed(6)),
    });
  } catch {
    // never let logging break the request
  }
}

/**
 * Whether managed mode is available at all.
 * Used by the UI to decide if "API key" prompts/banners need to show.
 */
export function isManagedAvailable(): boolean {
  return !!process.env.MANAGED_ANTHROPIC_KEY?.startsWith("sk-ant-");
}

export { CLAUDE_MODEL };
