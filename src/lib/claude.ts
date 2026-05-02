import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { decrypt } from "@/lib/crypto";
import { CLAUDE_MODEL } from "@/lib/constants";

export class NoApiKeyError extends Error {
  constructor() {
    super("No Anthropic API key set for this user");
    this.name = "NoApiKeyError";
  }
}

/**
 * Returns an Anthropic SDK client authed with the *signed-in user's* key.
 * Throws NoApiKeyError if the user hasn't set one.
 */
export async function getUserAnthropic(): Promise<{
  client: Anthropic;
  userId: string;
}> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Not signed in");
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("encrypted_anthropic_key")
    .eq("user_id", user.id)
    .single();

  if (error || !data?.encrypted_anthropic_key) {
    throw new NoApiKeyError();
  }

  let apiKey: string;
  try {
    apiKey = decrypt(data.encrypted_anthropic_key);
  } catch (e) {
    throw new Error("Failed to decrypt API key — check ENCRYPTION_KEY env var");
  }

  return {
    client: new Anthropic({ apiKey }),
    userId: user.id,
  };
}

export { CLAUDE_MODEL };
