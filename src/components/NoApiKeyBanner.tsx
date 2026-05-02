"use client";

import Link from "next/link";
import { Brain } from "lucide-react";

export function NoApiKeyBanner() {
  return (
    <div className="border border-orange-500 bg-stone-950 p-6 text-center">
      <Brain size={28} className="text-orange-500 mx-auto mb-3" />
      <h3 className="text-lg font-light text-stone-100 mb-2">
        Vul je Anthropic API key in
      </h3>
      <p className="text-sm text-stone-400 font-mono leading-relaxed mb-4 max-w-md mx-auto">
        AI features (coach, voedingsanalyse, dag-feedback) werken met je eigen
        key. Pak 'm gratis op{" "}
        <a
          href="https://console.anthropic.com/settings/keys"
          target="_blank"
          rel="noreferrer"
          className="text-orange-400 underline"
        >
          console.anthropic.com
        </a>
        .
      </p>
      <Link
        href="/settings"
        className="inline-block bg-orange-500 text-stone-950 px-5 py-2.5 text-xs uppercase tracking-[0.2em] font-mono hover:bg-orange-400"
      >
        Instellingen →
      </Link>
    </div>
  );
}
