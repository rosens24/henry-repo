"use client";

import { FormEvent, useState } from "react";
import { SendHorizontal, TerminalSquare } from "lucide-react";
import type { XenomorphHandoff } from "@/lib/agent/xenomorph-handoff";

type TalkToXenomorphProps = {
  onQueued: (message: string) => void;
};

export function TalkToXenomorph({ onQueued }: TalkToXenomorphProps) {
  const [prompt, setPrompt] = useState("");
  const [handoffs, setHandoffs] = useState<XenomorphHandoff[]>([]);
  const [isSending, setIsSending] = useState(false);

  async function submitPrompt(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt) return;

    setIsSending(true);

    try {
      const response = await fetch("/api/xenomorph", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmedPrompt }),
      });

      if (!response.ok) throw new Error("XENOMORPH handoff failed.");

      const result = (await response.json()) as { handoff: XenomorphHandoff; message: string };
      setHandoffs((current) => [result.handoff, ...current].slice(0, 5));
      setPrompt("");
      onQueued(result.message);
    } catch {
      onQueued("XENOMORPH handoff failed locally. No code was changed or pushed.");
    } finally {
      setIsSending(false);
    }
  }

  return (
    <section className="hud-panel rounded-md p-3">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="hud-title">Talk to XENOMORPH</h2>
        <TerminalSquare className="size-4 text-zinc-200" />
      </div>
      <form onSubmit={submitPrompt} className="grid gap-3">
        <textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder="Send a prompt to XENOMORPH for code changes, product direction, or next build instructions..."
          className="min-h-24 resize-none rounded-md border border-zinc-300/20 bg-black/60 px-3 py-2 text-sm text-white outline-none placeholder:text-zinc-500"
        />
        <button
          type="submit"
          disabled={isSending}
          className="flex items-center justify-center gap-2 rounded-md border border-zinc-300/30 bg-zinc-300/15 px-3 py-2 text-sm font-semibold text-zinc-50"
        >
          <SendHorizontal className="size-4" />
          {isSending ? "Queueing" : "Send to XENOMORPH"}
        </button>
      </form>
      <div className="mt-3 grid gap-2">
        {handoffs.length === 0 ? (
          <p className="text-xs text-zinc-400">No local handoffs queued yet.</p>
        ) : (
          handoffs.map((handoff) => (
            <p key={handoff.id} className="rounded-md border border-zinc-300/15 bg-zinc-400/10 p-2 text-xs text-zinc-300">
              {handoff.status}: {handoff.prompt}
            </p>
          ))
        )}
      </div>
    </section>
  );
}
