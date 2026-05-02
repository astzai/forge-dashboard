"use client";

import { useEffect, useRef, useState } from "react";
import { Brain, Send } from "lucide-react";
import { appendChat, listChat } from "@/lib/db";
import { NoApiKeyBanner } from "@/components/NoApiKeyBanner";
import type { ChatMessage, Profile } from "@/lib/types";

const SUGGESTIONS = [
  "Wat moet ik vandaag eten?",
  "Hoe ga ik met mijn cut?",
  "Welke supplementen passen bij mij?",
  "Plateau doorbreken",
];

export function ChatTab({ profile }: { profile: Profile }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [needsKey, setNeedsKey] = useState(false); // only set after 402 from server
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listChat().then(setMessages).catch(() => {});
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  if (needsKey) return <NoApiKeyBanner />;

  const send = async () => {
    if (!input.trim() || loading) return;
    const userContent = input.trim();
    const newUserMsg: ChatMessage = { role: "user", content: userContent };
    const conv = [...messages, newUserMsg];
    setMessages(conv);
    setInput("");
    setLoading(true);

    try {
      await appendChat("user", userContent);
    } catch {
      /* non-fatal */
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: conv.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (res.status === 402) {
        setNeedsKey(true);
        setLoading(false);
        return;
      }

      const data = await res.json();
      const reply = data.reply || `Fout: ${data.error || "onbekend"}`;
      const assistantMsg: ChatMessage = { role: "assistant", content: reply };
      setMessages([...conv, assistantMsg]);
      try {
        await appendChat("assistant", reply);
      } catch {
        /* non-fatal */
      }
    } catch (err: any) {
      setMessages([
        ...conv,
        { role: "assistant", content: `Fout: ${err.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-280px)] min-h-[500px] border border-stone-800 bg-stone-950">
      <div className="px-6 py-4 border-b border-stone-800 flex items-center gap-3">
        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
        <span className="text-xs uppercase tracking-[0.2em] text-stone-400 font-mono">
          AI Coach — Online
        </span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <Brain size={32} className="text-orange-500 mx-auto mb-4" />
            <h3 className="text-lg font-light text-stone-200 mb-2">
              Stel je coach een vraag
            </h3>
            <p className="text-sm text-stone-500 font-mono mb-6">
              Volledig getraind op jouw profiel en logs
            </p>
            <div className="flex flex-wrap gap-2 justify-center max-w-md mx-auto">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  className="px-3 py-1.5 text-xs border border-stone-800 text-stone-400 hover:border-orange-500 hover:text-orange-400 transition-colors font-mono"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] p-4 ${
                m.role === "user"
                  ? "bg-orange-500 text-stone-950"
                  : "bg-stone-900 border border-stone-800 text-stone-200"
              }`}
            >
              <div className="text-[10px] uppercase tracking-wider opacity-60 mb-1.5 font-mono">
                {m.role === "user" ? "JIJ" : "COACH"}
              </div>
              <div className="text-sm whitespace-pre-wrap leading-relaxed">
                {m.content}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-stone-900 border border-stone-800 p-4">
              <div className="flex gap-1.5">
                <div
                  className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-stone-800 p-4">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Stel een vraag..."
            className="flex-1 bg-stone-900 border border-stone-800 px-4 py-3 text-sm text-stone-200 font-mono focus:outline-none focus:border-orange-500 placeholder:text-stone-600"
            disabled={loading}
          />
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            className="px-5 bg-orange-500 text-stone-950 hover:bg-orange-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
