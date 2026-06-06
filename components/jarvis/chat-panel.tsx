import type { JarvisMessage } from "@/lib/ai/types";
import { CommandMessage } from "@/components/jarvis/command-message";

type ChatPanelProps = {
  messages: JarvisMessage[];
  isLoading: boolean;
};

export function ChatPanel({ messages, isLoading }: ChatPanelProps) {
  return (
    <section className="max-h-[340px] overflow-hidden rounded-md border border-cyan-300/15 bg-slate-950/55 p-3 lg:max-h-[420px]">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="hud-title">Command Log</h2>
        <span className="rounded-md border border-cyan-300/15 bg-cyan-300/8 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-cyan-100">
          {messages.length} entries
        </span>
      </div>
      <div className="flex max-h-[260px] flex-col gap-3 overflow-y-auto pr-1 lg:max-h-[340px]">
        {messages.length === 0 ? <p className="text-sm text-slate-400">No command history yet.</p> : null}
        {messages.map((message) => (
          <CommandMessage key={message.id} message={message} />
        ))}
        {isLoading ? (
          <div className="data-rail inline-block w-fit rounded-md border border-cyan-300/20 bg-cyan-400/10 px-3 py-2 text-sm text-cyan-50">
            Henry IV is thinking...
          </div>
        ) : null}
      </div>
    </section>
  );
}
